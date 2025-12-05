import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { PasswordService } from 'src/crypto/password.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), PasswordService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
