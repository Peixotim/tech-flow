import { forwardRef, Module } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseController } from './enterprise.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseEntity } from './enterprise/enterprise.entity';
import { UsersModule } from 'src/users/users.module';
import { CryptoModule } from 'src/crypto/crypto.module';
import { PlaybookModule } from 'src/playbook/playbook.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnterpriseEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => PlaybookModule),
    CryptoModule,
  ],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
