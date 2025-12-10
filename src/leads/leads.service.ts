import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LeadsResponseDTO } from './DTOs/leads-create-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LeadsEntity } from './entity/leads.entity';
import { Repository } from 'typeorm';
import { LeadsCreateDTO } from './DTOs/leads-create.dto';
import { EnterpriseService } from 'src/enterprise/enterprise.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly enterpriseService: EnterpriseService,
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
}
