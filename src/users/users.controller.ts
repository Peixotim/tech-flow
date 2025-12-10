import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UsersResponseMasterDTO } from './DTOs/use-master-create-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from './enum/roles.enum';
import { UsersMasterCreateDTO } from './DTOs/users-master-create.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('master')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new Master user (Requires Master permission)',
  })
  @ApiResponse({
    status: 201,
    description: 'Master user created successfully',
    type: UsersResponseMasterDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or email already exists',
  })
  @ApiResponse({ status: 401, description: 'Invalid token or not provided' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Only Master users can perform this action',
  })
  public async createUserMaster(
    @Body() requestCreate: UsersMasterCreateDTO,
  ): Promise<UsersResponseMasterDTO> {
    return await this.usersService.createMaster(requestCreate);
  }
}
