import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { UsersResponseDTO } from 'src/users/DTOs/users-create-response.dto';
import { LoginUserDTO } from './DTOs/login-user.dto';
import { PasswordService } from 'src/crypto/password.service';
import { JwtPayload } from 'src/types/jwt-payload.types';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  public async registerUser(
    registerRequest: RegisterUserDTO,
  ): Promise<UsersResponseDTO> {
    const newUser = await this.usersService.createUser(registerRequest);
    return newUser;
  }

  public async loginUser(
    loginRequest: LoginUserDTO,
  ): Promise<{ access_token: string }> {
    if (!loginRequest || Object.keys(loginRequest).length === 0) {
      throw new BadGatewayException('Error: request payload is empty.');
    }

    const user = await this.usersService.findByMail(loginRequest.email);
    if (!user) {
      throw new NotFoundException(
        'Error, unable to find an account registered with this email!',
      );
    }
    try {
      const matches = await this.passwordService.verify(
        user.password,
        loginRequest.password,
      );
      if (!matches) {
        throw new UnauthorizedException(
          'Error: The data provided is incorrect !',
        );
      }

      const payload: JwtPayload = {
        sub: user.uuid,
        email: user.email,
        iss:
          this.configService.get<string>('JWT_ISSUER') ||
          'https://api.polofaculdades.com.br',
        aud:
          this.configService.get<string>('JWT_AUDIENCE') ||
          'https://api.polofaculdades.com.br',
        enterprise: user.enterprise?.uuid || null,
        role: user.role,
        jti: uuidv4(),
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Login process failed for email: ${loginRequest.email}. Reason: ${errorMessage}`,
        errorStack,
      );

      throw new InternalServerErrorException(
        'Unexpected error during login process. Please try again later.',
      );
    }
  }
}
