import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { EnterpriseEntity } from './enterprise/enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';
import { EnterpriseResponseDTO } from './DTOs/enterprise-reponse.dto';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(
    @InjectRepository(EnterpriseEntity)
    private readonly enterpriseRepository: Repository<EnterpriseEntity>,
  ) {}

  public async createEnterprise(
    requestCreate: EnterpriseCreateDTO,
  ): Promise<EnterpriseResponseDTO> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    const existsCnpj = await this.findByCnpj(requestCreate.cnpj);
    if (existsCnpj) {
      throw new ConflictException(
        'Error already has a user registered with this email!',
      );
    }

    const existsSlug = await this.findBySlug(requestCreate.slug);

    if (existsSlug) {
      throw new ConflictException(
        'Error already has a user registered with this email!',
      );
    }

    try {
      const createEnterprise: EnterpriseCreateDTO = {
        ...requestCreate,
      };

      const newEnterprise =
        await this.enterpriseRepository.save(createEnterprise);

      const response: EnterpriseResponseDTO = {
        ...newEnterprise,
      };

      return response;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';

      const errorStack = error instanceof Error ? error.stack : undefined;
      const dbErrorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      this.logger.error({
        message: 'Failed to create enterprise',
        context: 'createEnterprise',
        attemptedData: {
          name: requestCreate.name,
          cnpj: requestCreate.cnpj,
          slug: requestCreate.slug,
        },
        error: errorMessage,
        code: dbErrorCode,
        stack: errorStack,
      });

      if (dbErrorCode === '23505') {
        throw new ConflictException(
          'Conflict detected: CNPJ or Slug already exists (Race condition).',
        );
      }
      throw new InternalServerErrorException(
        'Unexpected error while registering the enterprise. Please contact support.',
      );
    }
  }

  public async findByUuid(uuid: string): Promise<EnterpriseEntity | null> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { uuid },
    });

    if (!enterprise) {
      return null;
    }

    return enterprise;
  }

  public async findByCnpj(cnpj: string): Promise<EnterpriseEntity | null> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { cnpj },
    });

    if (!enterprise) {
      return null;
    }
    return enterprise;
  }
  public async findBySlug(slug: string): Promise<EnterpriseEntity | null> {
    const enterprise = await this.enterpriseRepository.findOne({
      where: { slug },
    });

    if (!enterprise) {
      return null;
    }
    return enterprise;
  }
}
