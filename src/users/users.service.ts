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
        role: requestCreate.role,
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
        enterpriseId: enterprise.uuid,
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
}
