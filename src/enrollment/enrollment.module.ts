import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './entity/enrollment.entity';
import { EnrollmentsService } from './enrollment.service';
import { LeadsModule } from 'src/leads/leads.module';

@Module({
  controllers: [EnrollmentController],
  imports: [TypeOrmModule.forFeature([EnrollmentEntity]), LeadsModule],
  providers: [EnrollmentsService],
})
export class EnrollmentModule {}
