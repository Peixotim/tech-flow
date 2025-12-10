import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.services';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { UsersResponseDTO } from 'src/users/DTOs/user-create-response.dto';
import { LoginUserDTO } from './DTOs/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UsersResponseDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiBody({ type: RegisterUserDTO })
  public async registerUser(
    @Body() requestRegister: RegisterUserDTO,
  ): Promise<UsersResponseDTO> {
    return await this.authService.registerUser(requestRegister);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials (email or password)',
  })
  @ApiResponse({ status: 400, description: 'Invalid data format' })
  @ApiBody({ type: LoginUserDTO })
  public async loginUser(
    @Body()
    requestLogin: LoginUserDTO,
  ): Promise<{ access_token: string }> {
    return await this.authService.loginUser(requestLogin);
  }
}
