import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { CryptoModule } from 'src/crypto/crypto.module';
import { EnterpriseModule } from 'src/enterprise/enterprise.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity]),
    CryptoModule,
    EnterpriseModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
