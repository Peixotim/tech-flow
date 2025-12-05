import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './DTOs/users-create.dto';
import { PasswordService } from '../crypto/password.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  public async createUser(requestCreate: UserCreateDTO): Promise<UsersEntity> {
    const user = await this.findByMail(requestCreate.email);

    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    if (user) {
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

      return userSaved;
    } catch (erro) {
      if (erro instanceof Error) {
        throw erro;
      }

      throw new Error('Unexpected error occurred.');
    }
  }
  public async findByMail(email: string): Promise<UsersEntity | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
