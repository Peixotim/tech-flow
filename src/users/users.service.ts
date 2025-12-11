import {
  BadRequestException,
  ConflictException,
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
import { UsersResponseDTO } from './DTOs/user-create-response.dto';
import { EnterpriseService } from 'src/enterprise/enterprise.service';
import { UsersResponseMasterDTO } from './DTOs/use-master-create-response.dto';
import { UsersMasterCreateDTO } from './DTOs/users-master-create.dto';
import { UserRoles } from './enum/roles.enum';
import { UsersModifyDTO } from './DTOs/users-modify.dto';
import { UserCreateAdminDTO } from './DTOs/users-create-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly passwordService: PasswordService,
    private readonly enterpriseService: EnterpriseService,
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
}
