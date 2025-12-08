import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './DTOs/users-create.dto';
import { PasswordService } from '../crypto/password.service';
import { UserResponseDTO } from './DTOs/user-create-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  public async createUser(
    requestCreate: UserCreateDTO,
  ): Promise<UserResponseDTO> {
    const userExists = await this.usersRepository.exists({
      where: { email: requestCreate.email },
    });

    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    if (userExists) {
      throw new ConflictException(
        'Error already has a user registered with this email!',
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
      });

      const userSaved: UsersEntity =
        await this.usersRepository.save(userCreate);

      const responseUser: UserResponseDTO = {
        uuid: userSaved.uuid,
        name: userSaved.name,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
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
    return await this.usersRepository.findOne({ where: { email } });
  }
}
