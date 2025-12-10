import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UsersResponseMasterDTO } from './DTOs/use-master-create-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from './enum/roles.enum';
import { UsersMasterCreateDTO } from './DTOs/users-master-create.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('master')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  public async createUserMaster(
    @Body() requestCreate: UsersMasterCreateDTO,
  ): Promise<UsersResponseMasterDTO> {
    return await this.usersService.createMaster(requestCreate);
  }
}
