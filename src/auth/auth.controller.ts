import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.services';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { UserResponseDTO } from 'src/users/DTOs/user-create-response.dto';
import { LoginUserDTO } from './DTOs/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async registerUser(
    @Body() requestRegister: RegisterUserDTO,
  ): Promise<UserResponseDTO> {
    return await this.authService.registerUser(requestRegister);
  }

  @Post('login')
  public async loginUser(
    @Body()
    requestLogin: LoginUserDTO,
  ): Promise<{ access_token: string }> {
    return await this.authService.loginUser(requestLogin);
  }
}
