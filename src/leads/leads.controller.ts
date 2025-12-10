import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeadsEntity } from './entity/leads.entity';
import { LeadsService } from './leads.service';
import { LeadsResponseDTO } from './DTOs/leads-create-response.dto';
import { LeadsCreateDTO } from './DTOs/leads-create.dto';
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
} from '@nestjs/swagger';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: LeadsResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiBody({ type: LeadsCreateDTO })
  public async createLead(
    @Body() requestCreate: LeadsCreateDTO,
  ): Promise<LeadsResponseDTO> {
    return await this.leadsService.createLead(requestCreate);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List ALL system leads (Master only)' })
  @ApiResponse({
    status: 200,
    description: 'Complete list of system leads',
    type: [LeadsEntity],
  })
  @ApiResponse({ status: 403, description: 'Access denied (Master only)' })
  public async getAllLeads(): Promise<LeadsEntity[] | null> {
    return await this.leadsService.getAll();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List leads for the logged-in user's enterprise" })
  @ApiResponse({
    status: 200,
    description: 'List of enterprise leads',
    type: [LeadsEntity],
  })
  @ApiResponse({ status: 401, description: 'Invalid token or not provided' })
  public async getLeads(@Headers('authorization') accessToken: string) {
    return await this.leadsService.getLeadsEnterpriseToken(accessToken);
  }
}
