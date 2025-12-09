import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsEntity } from './entity/leads.entity';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService],
  imports: [TypeOrmModule.forFeature([LeadsEntity])],
})
export class LeadsModule {}
