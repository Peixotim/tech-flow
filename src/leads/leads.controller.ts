import { Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { LeadsEntity } from './entity/leads.entity';
import { LeadsService } from './leads.service';
import { LeadsResponseDTO } from './DTOs/leads-create-response.dto';
import { LeadsCreateDTO } from './DTOs/leads-create.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/users/enum/roles.enum';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  public async createLead(
    requestCreate: LeadsCreateDTO,
  ): Promise<LeadsResponseDTO> {
    return await this.createLead(requestCreate);
  }

  //Apenas usuarios master podem ver todos os leads
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  public async getAllLeads(): Promise<LeadsEntity[] | null> {
    return await this.leadsService.getAll();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async getLeads(@Headers('authorization') accessToken: string) {
    return await this.leadsService.getLeadsEnterpriseToken(accessToken);
  }
}
