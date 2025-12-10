import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersEntity } from './entity/users.entity';
import { UsersModifyDTO } from './DTOs/users-modify.dto';

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
}
