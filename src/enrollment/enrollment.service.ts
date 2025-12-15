import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
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
      enrollmentDate: new Date(),
      lead: lead,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.leadsService.markAsWon(lead.uuid);

    return enrollment;
  }

  public async getMetrics(enterpriseId: string) {
    const now = new Date();

    // ... (definição de datas permanece igual)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart);

    // Definindo a interface para o resultado bruto do banco
    interface RevenueResult {
      total: string | null; // O TypeORM retorna SUM como string
    }

    // Executando Promise.all com tipagem
    const [
      totalRevenueResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      enrollmentsToday,
      enrollmentsYesterday,
      enrollmentsWeek,
    ] = await Promise.all([
      // A. Faturamento Total
      this.enrollmentRepo
        .createQueryBuilder('e')
        .select('SUM(e.value)', 'total')
        .where('e.enterpriseId = :id', { id: enterpriseId })
        .getRawOne<RevenueResult>(), // <--- Tipagem Genérica aqui

      // B. Faturamento Este Mês
      this.enrollmentRepo
        .createQueryBuilder('e')
        .select('SUM(e.value)', 'total')
        .where('e.enterpriseId = :id', { id: enterpriseId })
        .andWhere('e.createdAt >= :start', { start: thisMonthStart })
        .getRawOne<RevenueResult>(),

      // C. Faturamento Mês Passado
      this.enrollmentRepo
        .createQueryBuilder('e')
        .select('SUM(e.value)', 'total')
        .where('e.enterpriseId = :id', { id: enterpriseId })
        .andWhere('e.createdAt >= :start AND e.createdAt < :end', {
          start: lastMonthStart,
          end: lastMonthEnd,
        })
        .getRawOne<RevenueResult>(),

      // D. Counts (já retornam number, não precisa tipar extra)
      this.enrollmentRepo.count({
        where: {
          enterpriseId,
          createdAt: MoreThanOrEqual(todayStart),
        },
      }),

      this.enrollmentRepo.count({
        where: {
          enterpriseId,
          createdAt: Between(yesterdayStart, yesterdayEnd),
        },
      }),

      this.enrollmentRepo.count({
        where: {
          enterpriseId,
          createdAt: MoreThanOrEqual(
            new Date(new Date().setDate(new Date().getDate() - 7)),
          ),
        },
      }),
    ]);

    // Conversão segura (agora o TS sabe que 'total' existe em RevenueResult)
    const totalRevenue = Number(totalRevenueResult?.total ?? 0);
    const revenueThisMonth = Number(thisMonthRevenueResult?.total ?? 0);
    const revenueLastMonth = Number(lastMonthRevenueResult?.total ?? 0);

    // ... (restante da lógica de cálculo de trend permanece igual)
    let salesTrend = 0;
    if (enrollmentsYesterday === 0) {
      salesTrend = enrollmentsToday > 0 ? 100 : 0;
    } else {
      salesTrend = Math.round(
        ((enrollmentsToday - enrollmentsYesterday) / enrollmentsYesterday) *
          100,
      );
    }

    let revenueTrend = 0;
    if (revenueLastMonth === 0) {
      revenueTrend = revenueThisMonth > 0 ? 100 : 0;
    } else {
      revenueTrend = Math.round(
        ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
      );
    }

    return {
      totalRevenue,
      revenueThisMonth,
      enrollmentsToday,
      enrollmentsWeek,
      salesTrend,
      revenueTrend,
    };
  }
}
