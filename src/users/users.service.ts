import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './DTOs/users-create.dto';
import { PasswordService } from '../crypto/password.service';
import { UsersResponseDTO } from './DTOs/users-create-response.dto';
import { EnterpriseService } from 'src/enterprise/enterprise.service';
import { UsersResponseMasterDTO } from './DTOs/users-master-create-response.dto';
import { UsersMasterCreateDTO } from './DTOs/users-master-create.dto';
import { UserRoles } from './enum/roles.enum';
import { UsersModifyDTO } from './DTOs/users-modify.dto';
import { UserCreateAdminDTO } from './DTOs/users-create-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { UserCreateViewerDTO } from './DTOs/users-create-viewer.dto';
import { UpdateAvatarDTO } from './DTOs/users-avatar.dto';
import { AvatarConfig } from './types/users-avatar-config.types';
import { ChangePasswordDTO } from './DTOs/users-change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly passwordService: PasswordService,
    private readonly enterpriseService: EnterpriseService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  public async createUser(
    requestCreate: UserCreateDTO,
  ): Promise<UsersResponseDTO> {
    console.log(requestCreate);
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    const cleanCnpj = requestCreate.enterpriseCnpj.replace(/\D/g, '');
    const enterprise = await this.enterpriseService.findByCnpj(cleanCnpj);

    if (!enterprise) {
      throw new NotFoundException(
        `Error: Enterprise with CNPJ ${cleanCnpj} not found!`,
      );
    }

    try {
      const passwordHashed = await this.passwordService.hash(
        requestCreate.password,
      );
      const userCreate = this.usersRepository.create({
        name: requestCreate.name,
        email: requestCreate.email,
        password: passwordHashed,
        role: requestCreate.role || UserRoles.CLIENT_VIEWER,
        enterprise: enterprise,
      });

      const userSaved = await this.usersRepository.save(userCreate);

      const responseUser: UsersResponseDTO = {
        uuid: userSaved.uuid,
        name: userSaved.name,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        role: userSaved.role,
        enterpriseCnpj: enterprise.cnpj,
      };

      return responseUser;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...payloadSafe } = requestCreate;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      if (errorCode === '23505') {
        throw new ConflictException('Error: This email is already registered.');
      }

      this.logger.error({
        message: 'Critical error during user creation process',
        method: 'createUser',
        payload: payloadSafe,
        originalError: errorMessage,
        errorCode: errorCode,
        stack: error instanceof Error ? error.stack : null,
      });

      throw new InternalServerErrorException(
        'Unexpected error while creating user.',
      );
    }
  }

  public async createMaster(
    requestCreate: UsersMasterCreateDTO,
  ): Promise<UsersResponseMasterDTO> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    const userExists = await this.usersRepository.exists({
      where: { email: requestCreate.email },
    });

    if (userExists) {
      throw new ConflictException(
        'Error already has a user registered with this email!',
      );
    }
    try {
      const passwordHashed = await this.passwordService.hash(
        requestCreate.password,
      );

      const role: UserRoles = UserRoles.MASTER;

      const userCreate: UsersEntity = this.usersRepository.create({
        name: requestCreate.name,
        email: requestCreate.email,
        password: passwordHashed,
        role,
      });

      const userSaved: UsersEntity =
        await this.usersRepository.save(userCreate);

      const responseUser: UsersResponseMasterDTO = {
        uuid: userSaved.uuid,
        name: userSaved.name,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        role: userSaved.role,
      };

      return responseUser;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...payloadSafe } = requestCreate;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      this.logger.error({
        message: 'Critical error during master creation process',
        method: 'createUser',
        payload: payloadSafe,
        originalError: errorMessage,
        errorCode: errorCode,
        stack: error instanceof Error ? error.stack : null,
      });

      if (errorCode === '23505') {
        throw new ConflictException(
          'Email already registered (concurrency detected).',
        );
      }

      throw new InternalServerErrorException(
        'Unexpected error while creating user. Please try again later or contact support.',
      );
    }
  }

  public async createUserAdmin(
    requestCreate: UserCreateAdminDTO,
  ): Promise<UsersResponseDTO> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    const userExists = await this.usersRepository.exists({
      where: { email: requestCreate.email },
    });

    if (userExists) {
      throw new ConflictException(
        'Error already has a user registered with this email!',
      );
    }

    const enterprise = await this.enterpriseService.findByUuid(
      requestCreate.enterpriseId,
    );

    if (!enterprise) {
      throw new NotFoundException(
        'Error, the company with this uuid does not exist!',
      );
    }
    try {
      const passwordHashed = await this.passwordService.hash(
        requestCreate.password,
      );

      const userCreate: UsersEntity = this.usersRepository.create({
        name: requestCreate.name,
        email: requestCreate.email,
        password: passwordHashed,
        role: UserRoles.CLIENT_ADMIN,
        enterprise: enterprise,
      });

      const userSaved: UsersEntity =
        await this.usersRepository.save(userCreate);

      const responseUser: UsersResponseDTO = {
        uuid: userSaved.uuid,
        name: userSaved.name,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        role: userSaved.role,
        enterpriseCnpj: enterprise.cnpj,
      };

      return responseUser;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...payloadSafe } = requestCreate;

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      this.logger.error({
        message: 'Critical error during user creation process',
        method: 'createUser',
        payload: payloadSafe,
        originalError: errorMessage,
        errorCode: errorCode,
        stack: error instanceof Error ? error.stack : null,
      });

      if (errorCode === '23505') {
        throw new ConflictException(
          'Email already registered (concurrency detected).',
        );
      }

      throw new InternalServerErrorException(
        'Unexpected error while creating user. Please try again later or contact support.',
      );
    }
  }
  public async findByMail(email: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['enterprise'],
      select: {
        uuid: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        enterprise: {
          uuid: true,
        },
      },
    });
  }

  public async findByUuid(uuid: string): Promise<UsersEntity | null> {
    return await this.usersRepository.findOne({
      where: { uuid },
      relations: ['enterprise'],
      select: {
        uuid: true,
        name: true,
        email: true,
        password: false,
        role: true,
        isActive: true,
        enterprise: {
          uuid: true,
        },
      },
    });
  }

  public async getAllUsers(): Promise<UsersEntity[] | null> {
    const users = await this.usersRepository.find();
    if (!users) {
      return null;
    }

    return users;
  }

  public async modifyUser(uuid: string, requestModifyUser: UsersModifyDTO) {
    const user = await this.usersRepository.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundException(
        'Error, could not find a user with this uuid!',
      );
    }

    if (requestModifyUser.email && requestModifyUser.email !== user.email) {
      const emailAlreadyExists = await this.usersRepository.findOne({
        where: { email: requestModifyUser.email },
      });

      if (emailAlreadyExists) {
        throw new ConflictException(
          'Error: This email is already in use by another user.',
        );
      }
    }

    try {
      const modifyUser = this.usersRepository.merge(user, requestModifyUser);
      const saved = await this.usersRepository.save(modifyUser);

      this.logger.log(`User ${saved.uuid} updated successfully.`);

      return saved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(`Error updating user: ${error}`);
      throw new InternalServerErrorException(
        'Unexpected error while updating user.',
      );
    }
  }

  public async getProfile(uuid: string): Promise<UsersResponseDTO> {
    const user = await this.usersRepository.findOne({
      where: { uuid },
      relations: ['enterprise'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (!user.enterprise) {
      throw new ForbiddenException(
        `Error: You are not registered with any company.`,
      );
    }
    const response: UsersResponseDTO = {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      enterpriseCnpj: user.enterprise.cnpj,
      avatarConfig: user.avatarConfig,
      level: user.level,
      experiencePoints: user.experiencePoints,
      unlockedItems: user.unlockedItems,
    };

    return response;
  }

  public async findByIdWithEnterprise(
    uuid: string,
  ): Promise<UsersEntity | null> {
    return await this.usersRepository.findOne({
      where: { uuid },
      relations: ['enterprise'],
    });
  }

  public async createViewer(
    requestCreate: UserCreateViewerDTO,
    managerEnterpriseId: string,
  ) {
    const userExists = await this.usersRepository.exists({
      where: { email: requestCreate.email },
    });

    if (userExists) {
      throw new ConflictException('Error: This email is already in use!');
    }

    const enterprise =
      await this.enterpriseService.findByUuid(managerEnterpriseId);

    if (!enterprise) {
      throw new NotFoundException('Manager enterprise not found.');
    }
    try {
      const passwordHashed = await this.passwordService.hash(
        requestCreate.password,
      );

      const createUser = this.usersRepository.create({
        name: requestCreate.name,
        email: requestCreate.email,
        password: passwordHashed,
        role: UserRoles.CLIENT_VIEWER,
        enterprise: enterprise,
      });

      const saved = await this.usersRepository.save(createUser);
      return {
        uuid: saved.uuid,
        name: saved.name,
        email: saved.email,
        createdAt: saved.createdAt,
        role: saved.role,
        enterpriseCnpj: saved.enterprise?.cnpj,
      };
    } catch (error) {
      this.logger.error(`Error creating viewer: ${error}`);
      throw new InternalServerErrorException('Error creating employee user.');
    }
  }

  public async getUsersByEnterprise(
    enterpriseId: string,
  ): Promise<UsersEntity[]> {
    const users = await this.usersRepository.find({
      where: { enterprise: { uuid: enterpriseId } },
      order: { createdAt: 'DESC' },
    });

    if (!users) {
      return [];
    }

    return users;
  }

  public async deleteEnterpriseId(
    enterpriseId: string,
    userUuid: string,
    requesterId?: string,
  ) {
    if (requesterId && userUuid === requesterId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const user = await this.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRoles.CLIENT_ADMIN) {
      throw new ForbiddenException('Cannot delete an Administrator account.');
    }

    if (!user.enterprise || user.enterprise.uuid !== enterpriseId) {
      throw new ForbiddenException(
        'You do not have permission to delete this user (Different Enterprise).',
      );
    }

    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  public async inactive(
    enterpriseId: string,
    userUuid: string,
    requesterId?: string,
  ) {
    if (requesterId && userUuid === requesterId) {
      throw new BadRequestException('You cannot deactivate your own account.');
    }

    const user = await this.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRoles.CLIENT_ADMIN) {
      throw new ForbiddenException(
        'Cannot deactivate an Administrator account.',
      );
    }

    if (!user.enterprise || user.enterprise.uuid !== enterpriseId) {
      throw new ForbiddenException(
        'You do not have permission to modify this user.',
      );
    }

    user.isActive = false;

    const saved = await this.usersRepository.save(user);

    return {
      uuid: saved.uuid,
      isActive: saved.isActive,
      message: 'User deactivated successfully',
    };
  }

  public async activate(
    enterpriseId: string,
    userUuid: string,
    requesterId?: string,
  ) {
    if (requesterId && userUuid === requesterId) {
      throw new BadRequestException('You cannot reactivate your own account.');
    }

    const user = await this.findByUuid(userUuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRoles.CLIENT_ADMIN) {
      throw new ForbiddenException(
        'Cannot reactivate an Administrator account.',
      );
    }

    if (!user.enterprise || user.enterprise.uuid !== enterpriseId) {
      throw new ForbiddenException(
        'You do not have permission to modify this user.',
      );
    }

    user.isActive = true;

    const saved = await this.usersRepository.save(user);

    return {
      uuid: saved.uuid,
      isActive: saved.isActive,
      message: 'User activated successfully',
    };
  }

  public async updateAvatar(uuid: string, avatarConfig: UpdateAvatarDTO) {
    const user = await this.findByUuid(uuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const currentConfig: Partial<AvatarConfig> = user.avatarConfig ?? {};

    user.avatarConfig = {
      ...currentConfig,
      characterId: avatarConfig.characterId,
      background: avatarConfig.background,
      aura: avatarConfig.aura || 'none',
    } as AvatarConfig;

    return await this.usersRepository.save(user);
  }

  public async updateStats(
    uuid: string,
    experiencePoints: number,
    level: number,
  ) {
    return await this.usersRepository.update(uuid, {
      experiencePoints,
      level,
    });
  }

  public async addUnlockedItems(uuid: string, newItems: string[]) {
    const user = await this.findByUuid(uuid);
    if (!user) return;

    const currentItems = user.unlockedItems || [];
    const updatedItems = [...new Set([...currentItems, ...newItems])];

    return await this.usersRepository.update(uuid, {
      unlockedItems: updatedItems,
    });
  }

  public async changePassword(uuid: string, dto: ChangePasswordDTO) {
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.uuid = :uuid', { uuid })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isPasswordValid = await this.passwordService.verify(
      user.password,
      dto.oldPassword,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('A senha atual está incorreta.');
    }

    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    user.password = newPasswordHash;
    await this.usersRepository.update(uuid, {
      password: newPasswordHash,
    });

    return { message: 'Senha alterada com sucesso!' };
  }
}
