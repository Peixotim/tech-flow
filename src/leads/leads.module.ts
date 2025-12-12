import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsEntity } from './entity/leads.entity';
import { EnterpriseModule } from 'src/enterprise/enterprise.module';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [TypeOrmModule.forFeature([LeadsEntity]), EnterpriseModule],
  exports: [LeadsService],
})
export class LeadsModule {}
