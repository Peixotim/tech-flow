import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsEntity } from './entity/leads.entity';
import { EnterpriseModule } from 'src/enterprise/enterprise.module';
import { LeadHistoryEntity } from './entity/lead-history.entity';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [
    TypeOrmModule.forFeature([LeadsEntity, LeadHistoryEntity]),
    EnterpriseModule,
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
