import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateGoalDTO } from './DTOs/enterprise-update-goal.dto';

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRoles.CLIENT_ADMIN, UserRoles.MASTER, UserRoles.CLIENT_VIEWER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get details of the current logged-in enterprise',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the enterprise details including monthly goal.',
    type: EnterpriseEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getMyEnterprise(
    @CurrentUser() user: { enterprise: { uuid: string } },
  ) {
    return await this.enterpriseService.findByUuid(user.enterprise.uuid);
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
    summary: 'Register a new company and its owner user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Company and user successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  public async onboardNewTenant(
    @Body() requestCreate: EnterpriseCreateAndUserDTO,
  ): Promise<EnterpriseResponseCreateAndUser> {
    return await this.enterpriseService.enterpriseAndUser(requestCreate);
  }

  @Get('cnpj/:cnpj')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find Enterprise by CNPJ',
    description:
      'Searches for a registered enterprise using its CNPJ document.',
  })
  @ApiParam({
    name: 'cnpj',
    description: 'CNPJ with or without punctuation',
    example: '12.345.678/0001-90',
  })
  @ApiResponse({
    status: 200,
    description: 'Enterprise found',
    type: EnterpriseEntity,
  })
  @ApiResponse({ status: 404, description: 'Enterprise not found' })
  public async getCnpj(
    @Param('cnpj') enterpriseCnpj: string,
  ): Promise<EnterpriseEntity> {
    const cleanCnpj = enterpriseCnpj.replace(/\D/g, '');
    const enterprise = await this.enterpriseService.findByCnpj(cleanCnpj);
    if (!enterprise) {
      throw new NotFoundException('Enterprise not found with this CNPJ.');
    }
    return enterprise;
  }

  @Patch('goal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN, UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update the monthly revenue goal',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully.',
    type: EnterpriseEntity,
  })
  public async updateGoal(
    @Body() updateData: UpdateGoalDTO,
    @CurrentUser() user: { enterprise: { uuid: string } },
  ) {
    return await this.enterpriseService.updateGoal(
      user.enterprise.uuid,
      updateData.goal,
    );
  }
}
