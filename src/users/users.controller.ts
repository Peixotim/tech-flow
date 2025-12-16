import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UsersResponseMasterDTO } from './DTOs/users-master-create-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from './enum/roles.enum';
import { UsersMasterCreateDTO } from './DTOs/users-master-create.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersEntity } from './entity/users.entity';
import { UsersModifyDTO } from './DTOs/users-modify.dto';
import { UsersResponseDTO } from './DTOs/users-create-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserCreateViewerDTO } from './DTOs/users-create-viewer.dto';

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

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.MASTER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List ALL registered users (Requires Master permission)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users in the system',
    type: [UsersEntity],
  })
  @ApiResponse({ status: 401, description: 'Invalid token or not provided' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Only Master users can access this list',
  })
  public async getAllUsers(): Promise<UsersEntity[] | null> {
    return await this.usersService.getAllUsers();
  }

  @Patch(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user details (Name or Email)' })
  @ApiParam({
    name: 'uuid',
    description: 'Unique UUID of the user to be modified',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UsersEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 401, description: 'Invalid token or not provided' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Email already in use by another user',
  })
  public async modifyUser(
    @Param('uuid') uuid: string,
    @Body() requestModify: UsersModifyDTO,
  ) {
    return await this.usersService.modifyUser(uuid, requestModify);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user data',
    type: UsersResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async getMe(@CurrentUser() user: { uuid: string; email: string }) {
    return await this.usersService.getProfile(user.uuid);
  }

  @Post('viewer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new Employee (Viewer) for the current Enterprise',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: UsersResponseDTO,
  })
  public async createViewer(
    @Body() requestCreate: UserCreateViewerDTO,
    @CurrentUser() user: { uuid: string; enterprise: { uuid: string } },
  ) {
    return await this.usersService.createViewer(
      requestCreate,
      user.enterprise.uuid,
    );
  }

  @Get('team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all users belonging to the current user enterprise',
  })
  @ApiResponse({
    status: 200,
    description: 'List of team members',
    type: [UsersEntity],
  })
  public async getTeam(@CurrentUser() user: { enterprise: { uuid: string } }) {
    return await this.usersService.getUsersByEnterprise(user.enterprise.uuid);
  }

  @Patch(':uuid/inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deactivate (or toggle) a user status',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the user to deactivate',
  })
  @ApiResponse({
    status: 200,
    description: 'User status successfully toggled.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async deactivateUser(
    @Param('uuid') userUuid: string,
    @CurrentUser()
    user: { uuid: string; enterprise: { uuid: string } },
  ) {
    return await this.usersService.inactive(
      user.enterprise.uuid,
      userUuid,
      user.uuid,
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Permanently delete a user',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID of the user to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async deleteUser(
    @Param('uuid') userUuid: string,
    @CurrentUser()
    user: { uuid: string; enterprise: { uuid: string } },
  ) {
    return await this.usersService.deleteEnterpriseId(
      user.enterprise.uuid,
      userUuid,
      user.uuid,
    );
  }

  @Patch(':uuid/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.CLIENT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate a user account' })
  @ApiParam({ name: 'uuid', description: 'UUID of the user to reactivate' })
  @ApiResponse({ status: 200, description: 'User successfully activated.' })
  public async activateUser(
    @Param('uuid') userUuid: string,
    @CurrentUser() user: { uuid: string; enterprise: { uuid: string } },
  ) {
    return await this.usersService.activate(
      user.enterprise.uuid,
      userUuid,
      user.uuid,
    );
  }
}
