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
import { Repository } from 'typeorm';
import { LeadsCreateDTO } from './DTOs/leads-create.dto';
import { EnterpriseService } from 'src/enterprise/enterprise.service';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/types/jwt-payload.types';
import { LeadStatus } from './enums/lead-status.enum';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
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
    await this.leadsRepository.update(uuid, { status: LeadStatus.WON });
  }
}
