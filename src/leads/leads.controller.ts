import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/types/user-payload.type';
import { UpdateLeadDTO } from './DTOs/leads-update.dto';

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
  @ApiOperation({
    summary: "List leads for the logged-in user's enterprise with pagination",
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of enterprise leads',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or number',
  })
  public async getLeads(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return await this.leadsService.findAllWithFilters(user.enterprise.uuid, {
      page,
      limit,
      search,
    });
  }

  @Patch(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lead status or info' })
  @ApiResponse({
    status: 200,
    description: 'Lead updated successfully',
    type: LeadsResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  public async updateLead(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateData: UpdateLeadDTO,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.leadsService.update(
      uuid,
      user.enterprise.uuid,
      updateData,
    );
  }

  @Get(':id/history')
  public async getHistory(@Param('id') id: string) {
    return await this.leadsService.getHistory(id);
  }
}
