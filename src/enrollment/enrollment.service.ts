import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entity/enrollment.entity';
import { CreateEnrollmentDTO } from './DTOs/enrollment-create.dto';
import { LeadsService } from 'src/leads/leads.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepo: Repository<EnrollmentEntity>,
    private readonly leadsService: LeadsService,
  ) {}

  public async create(createDto: CreateEnrollmentDTO, enterpriseId: string) {
    const lead = await this.leadsService.findOneByEnterprise(
      createDto.leadId,
      enterpriseId,
    );

    if (!lead) {
      throw new NotFoundException(
        'Lead não encontrado ou não pertence a esta empresa.',
      );
    }

    const enrollment = this.enrollmentRepo.create({
      ...createDto,
      enterpriseId,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.leadsService.markAsWon(lead.uuid);

    return enrollment;
  }

  public async getMetrics(enterpriseId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueResult = ((await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .select('SUM(enrollment.value)', 'total')
      .where('enrollment.enterpriseId = :id', { id: enterpriseId })
      .getRawOne()) as { total: number | null }) ?? { total: null };

    const enrollmentsToday = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .where('enrollment.enterpriseId = :id', { id: enterpriseId })
      .andWhere('enrollment.createdAt >= :today', { today })
      .getCount();

    return {
      totalRevenue: Number(revenueResult.total) || 0,
      enrollmentsToday,
    };
  }
}
