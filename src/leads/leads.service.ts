/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LeadsResponseDTO } from './DTOs/leads-create-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeadsEntity } from './entity/leads.entity';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { LeadsCreateDTO } from './DTOs/leads-create.dto';
import { EnterpriseService } from 'src/enterprise/enterprise.service';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/jwt-payload.types';
import { LeadStatus } from './enums/lead-status.enum';
import { UpdateLeadDTO } from './DTOs/leads-update.dto';
import { LeadHistoryEntity } from './entity/lead-history.entity';
import { HistoryType } from './enums/lead-history.enum';
import { LeadsNewManagerDTO } from './DTOs/leads-new-manager.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    @InjectRepository(LeadHistoryEntity)
    private readonly leadsHistoryRepository: Repository<LeadHistoryEntity>,
    private readonly enterpriseService: EnterpriseService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(LeadsService.name);

  public async createLead(
    requestCreate: LeadsCreateDTO,
  ): Promise<LeadsResponseDTO> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadGatewayException('Error: request payload is empty.');
    }

    const enterprise = await this.enterpriseService.findByUuid(
      requestCreate.enterpriseId,
    );

    if (!enterprise) {
      throw new NotFoundException('Error, there is no company with this UUID!');
    }

    try {
      const createLead: LeadsEntity = this.leadsRepository.create({
        name: requestCreate.name,
        email: requestCreate.email,
        number: requestCreate.number,
        enterprise: enterprise,
      });

      const newLead: LeadsEntity = await this.leadsRepository.save(createLead);

      const response: LeadsResponseDTO = {
        ...newLead,
        enterpriseId: newLead.enterprise.uuid,
      };

      await this.leadsHistoryRepository.save({
        lead: newLead,
        type: HistoryType.CREATION,
        description: 'Lead criado no sistema via API/Formulário.',
      });
      return response;
    } catch (error: unknown) {
      const payload: LeadsCreateDTO = {
        ...requestCreate,
      };
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      this.logger.error({
        message: 'Critical error during lead creation process',
        method: 'createLead',
        payload: payload,
        originalError: errorMessage,
        errorCode: errorCode,
        stack: error instanceof Error ? error.stack : null,
      });

      throw new InternalServerErrorException(
        'Unexpected error while creating lead. Please try again later or contact support.',
      );
    }
  }

  public async getAll(): Promise<LeadsEntity[] | null> {
    const leads: LeadsEntity[] = await this.leadsRepository.find();
    if (!leads) {
      return null;
    }
    return leads;
  }

  public async getLeadEnterprise(enterpriseId: string): Promise<LeadsEntity[]> {
    const enterprise: EnterpriseEntity | null =
      await this.enterpriseService.findByUuid(enterpriseId);
    if (!enterprise) {
      throw new NotFoundException('Error: No company was found with this uuid');
    }

    const leads: LeadsEntity[] = await this.leadsRepository.find({
      where: { enterprise: { uuid: enterpriseId } },
      relations: ['enterprise'],
    });

    if (!leads || leads.length === 0) {
      throw new NotFoundException(
        'Error, no leads were found for this company!',
      );
    }
    return leads;
  }

  public async getLeadsEnterpriseToken(
    access_token: string,
  ): Promise<LeadsEntity[]> {
    const token = access_token.replace('Bearer ', '').trim();
    try {
      const payload: JwtPayload = this.jwtService.verify(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid token format.');
      }

      if (!payload.enterprise) {
        throw new UnauthorizedException(
          'User is not associated with any Enterprise.',
        );
      }

      return await this.getLeadEnterprise(payload.enterprise);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(`Error decoding token: ${error}`);
      throw new UnauthorizedException('Failed to process token');
    }
  }

  public async findOneByEnterprise(
    uuid: string,
    enterpriseId: string,
  ): Promise<LeadsEntity> {
    const lead = await this.leadsRepository.findOne({
      where: { uuid, enterprise: { uuid: enterpriseId } },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado ou acesso negado.');
    }

    return lead;
  }

  public async markAsWon(uuid: string) {
    await this.leadsRepository.update(uuid, { status: LeadStatus.GANHO });
  }

  public async findAllWithFilters(
    enterpriseId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      sdrId?: string;
    },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    let whereCondition:
      | FindOptionsWhere<LeadsEntity>
      | FindOptionsWhere<LeadsEntity>[];

    const baseFilter: FindOptionsWhere<LeadsEntity> = {
      enterprise: { uuid: enterpriseId },
    };

    if (query.sdrId === 'null') {
      baseFilter.sdr = IsNull();
    } else {
      baseFilter.sdr = { uuid: query.sdrId };
    }
    if (query.search) {
      whereCondition = [
        { ...baseFilter, name: ILike(`%${query.search}%`) },
        { ...baseFilter, number: ILike(`%${query.search}%`) },
      ];
    } else {
      whereCondition = baseFilter;
    }

    const [data, total] = await this.leadsRepository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
      relations: ['enterprise', 'sdr', 'enrollment'],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  public async update(
    uuid: string,
    entepriseId: string,
    updateData: UpdateLeadDTO,
  ): Promise<LeadsEntity> {
    const lead = await this.findOneByEnterprise(uuid, entepriseId);
    const oldStatus = lead.status;

    this.leadsRepository.merge(lead, updateData);

    if (updateData.status && updateData.status !== oldStatus) {
      await this.leadsHistoryRepository.save({
        lead,
        type: HistoryType.STATUS_CHANGE,
        description: `Status alterado de ${oldStatus} para ${updateData.status}`,
      });
    }

    return await this.leadsRepository.save(lead);
  }

  public async getHistory(leadUuid: string) {
    return this.leadsHistoryRepository.find({
      where: {
        lead: { uuid: leadUuid },
      },
      order: { createdAt: 'DESC' },
    });
  }

  public async assignLead(
    leadUuid: string,
    sdrUuid: string,
    enterpriseId: string,
  ) {
    const lead = await this.findOneByEnterprise(leadUuid, enterpriseId);

    lead.sdr = { uuid: sdrUuid } as any;

    await this.leadsHistoryRepository.save({
      lead,
      type: HistoryType.STATUS_CHANGE,
      description: `Lead atribuído ao SDR ID: ${sdrUuid}`,
    });
    return this.leadsRepository.save(lead);
  }

  public async newLead(lead: LeadsNewManagerDTO, enterpriseId: string) {
    const enterprise = await this.enterpriseService.findByUuid(enterpriseId);

    if (!enterprise) {
      throw new NotFoundException(`Error enterprise not found`);
    }

    const createLead = this.leadsRepository.create({
      ...lead,
      enterprise: enterprise,
    });

    const savedLead = await this.leadsRepository.save(createLead);

    await this.leadsHistoryRepository.save({
      lead: savedLead,
      type: HistoryType.CREATION,
      description: `Lead cadastrado manualmente pelo Gestor. Origem: ${lead.origin.toUpperCase()}`,
    });

    return savedLead;
  }
}
