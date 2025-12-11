import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EnterpriseEntity } from './enterprise/enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';
import { EnterpriseResponseDTO } from './DTOs/enterprise-reponse.dto';
import { UsersService } from 'src/users/users.service';
import { EnterpriseCreateAndUserDTO } from './DTOs/enterprise-user-create.dto';
import { EnterpriseResponseCreateAndUser } from './DTOs/enterprise-user-response.dto';
import { PasswordService } from 'src/crypto/password.service';
import { UserRoles } from 'src/users/enum/roles.enum';
import { UsersEntity } from 'src/users/entity/users.entity';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(
    @InjectRepository(EnterpriseEntity)
    private readonly enterpriseRepository: Repository<EnterpriseEntity>,

    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
  ) {}

  public async createEnterprise(
    requestCreate: EnterpriseCreateDTO,
  ): Promise<EnterpriseResponseDTO> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    try {
      const cleanCnpj = requestCreate.cnpj.replace(/\D/g, '');

      const createEnterprise = this.enterpriseRepository.create({
        ...requestCreate,
        cnpj: cleanCnpj,
      });

      const newEnterprise =
        await this.enterpriseRepository.save(createEnterprise);

      return newEnterprise;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';
      const dbErrorCode =
        error instanceof Object && 'code' in error
          ? (error as Record<string, unknown>).code
          : null;

      if (dbErrorCode === '23505') {
        const detail = (error as { detail?: string }).detail || '';

        if (detail.includes('cnpj')) {
          throw new ConflictException(
            'Error: An enterprise is already registered with this CNPJ!',
          );
        }
        if (detail.includes('slug')) {
          throw new ConflictException(
            'Error: An enterprise is already registered with this Slug!',
          );
        }

        throw new ConflictException('Conflict detected: Data already exists.');
      }

      this.logger.error({
        message: 'Failed to create enterprise',
        context: 'createEnterprise',
        payload: { slug: requestCreate.slug },
        error: errorMessage,
        code: dbErrorCode,
      });

      throw new InternalServerErrorException(
        'Unexpected error while registering the enterprise. Please contact support.',
      );
    }
  }

  public async findByUuid(uuid: string): Promise<EnterpriseEntity | null> {
    return await this.enterpriseRepository.findOne({ where: { uuid } });
  }

  public async findByCnpj(cnpj: string): Promise<EnterpriseEntity | null> {
    const cleanCnpj = cnpj.replace(/\D/g, '').trim();

    this.logger.debug(
      `🔍 Buscando Empresa | Input Original: '${cnpj}' | Limpo: '${cleanCnpj}'`,
    );

    const enterprise = await this.enterpriseRepository.findOne({
      where: { cnpj: cleanCnpj },
    });

    if (enterprise) {
      this.logger.log(
        `✅ Empresa encontrada: ${enterprise.name} (UUID: ${enterprise.uuid})`,
      );
    } else {
      this.logger.warn(
        `❌ Nenhuma empresa encontrada para o CNPJ: '${cleanCnpj}'`,
      );
      const all = await this.enterpriseRepository.find({ select: ['cnpj'] });
      this.logger.debug(
        `📋 CNPJs disponíveis no banco: ${all.map((e) => `'${e.cnpj}'`).join(', ')}`,
      );
    }

    return enterprise;
  }

  public async findBySlug(slug: string): Promise<EnterpriseEntity | null> {
    return await this.enterpriseRepository.findOne({ where: { slug } });
  }

  public async getAll(): Promise<EnterpriseEntity[]> {
    const enterprises = await this.enterpriseRepository.find();
    return enterprises || [];
  }

  public async enterpriseAndUser(
    requestCreate: EnterpriseCreateAndUserDTO,
  ): Promise<EnterpriseResponseCreateAndUser> {
    if (!requestCreate || Object.keys(requestCreate).length === 0) {
      throw new BadRequestException('Error: request payload is empty.');
    }

    const [existsEmail, existsCnpj, existsSlug] = await Promise.all([
      this.usersService.findByMail(requestCreate.email),
      this.findByCnpj(requestCreate.cnpj),
      this.findBySlug(requestCreate.slug),
    ]);

    if (existsEmail)
      throw new ConflictException(
        'Error: A user is already registered with this email!',
      );
    if (existsCnpj)
      throw new ConflictException(
        'Error: An enterprise is already registered with this CNPJ!',
      );
    if (existsSlug)
      throw new ConflictException(
        'Error: An enterprise is already registered with this Slug!',
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cleanCnpj = requestCreate.cnpj.replace(/\D/g, '');

      const newEnterprise = queryRunner.manager.create(EnterpriseEntity, {
        name: requestCreate.name,
        slug: requestCreate.slug,
        cnpj: cleanCnpj,
        primaryColor: requestCreate.primaryColor,
        isActive: requestCreate.isActive,
        logoUrl: requestCreate.logoUrl,
      });

      const savedEnterprise = await queryRunner.manager.save(newEnterprise);

      const passwordHash = await this.passwordService.hash(
        requestCreate.password,
      );

      const newUser = queryRunner.manager.create(UsersEntity, {
        email: requestCreate.email,
        name: requestCreate.fullerName,
        password: passwordHash,
        role: UserRoles.CLIENT_ADMIN,
        enterprise: savedEnterprise,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();

      const response: EnterpriseResponseCreateAndUser = {
        userUuid: savedUser.uuid,
        userName: savedUser.name,
        email: savedUser.email,
        createdAt: savedUser.createdAt,

        enterpriseUuid: savedEnterprise.uuid,
        enterpriseName: savedEnterprise.name,
        slug: savedEnterprise.slug,
        cnpj: savedEnterprise.cnpj,
        logoUrl: savedEnterprise.logoUrl,
        primaryColor: savedEnterprise.primaryColor,
        isActive: savedEnterprise.isActive,
      };

      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Transaction failed for onboarding: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Unexpected error during onboarding transaction.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
