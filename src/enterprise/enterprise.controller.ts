import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';
import { EnterpriseResponseDTO } from './DTOs/enterprise-reponse.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/users/enum/roles.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { EnterpriseEntity } from './enterprise/enterprise.entity';
import { EnterpriseCreateAndUserDTO } from './DTOs/enterprise-user-create.dto';
import { EnterpriseResponseCreateAndUser } from './DTOs/enterprise-user-response.dto';

@ApiTags('Enterprises')
@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register a new Enterprise (Master only)',
    description:
      'Creates a new company in the system. Requires unique CNPJ and Slug.',
  })
  @ApiResponse({
    status: 201,
    description: 'Enterprise created successfully',
    type: EnterpriseResponseDTO,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: CNPJ or Slug already exists',
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized / Invalid Token' })
  @ApiBody({ type: EnterpriseCreateDTO })
  public async createEnterprise(
    @Body() requestCreate: EnterpriseCreateDTO,
  ): Promise<EnterpriseResponseDTO> {
    return await this.enterpriseService.createEnterprise(requestCreate);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all registered Enterprises' })
  @ApiResponse({
    status: 200,
    description: 'List of all enterprises',
    type: [EnterpriseEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getAllEnterprises(): Promise<EnterpriseEntity[] | null> {
    return await this.enterpriseService.getAll();
  }

  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiOperation({ summary: 'Find an Enterprise by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'The UUID of the enterprise',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Enterprise found',
    type: EnterpriseEntity,
  })
  @ApiResponse({ status: 404, description: 'Enterprise not found' })
  public async getEnterpriseByUuid(
    @Param('uuid') uuid: string,
  ): Promise<EnterpriseEntity | null> {
    return await this.enterpriseService.findByUuid(uuid);
  }

  @Post('onboarding')
  @ApiOperation({
    summary: 'Registra uma nova empresa e seu usuário proprietário',
  })
  @ApiResponse({
    status: 201,
    description: 'Empresa e usuário criados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  public async onboardNewTenant(
    @Body() requestCreate: EnterpriseCreateAndUserDTO,
  ): Promise<EnterpriseResponseCreateAndUser> {
    return await this.enterpriseService.enterpriseAndUser(requestCreate);
  }
}
