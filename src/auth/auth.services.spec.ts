import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.services';
import { UsersService } from '../users/users.service';
import { PasswordService } from '../crypto/password.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadGatewayException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDTO } from './DTOs/login-user.dto';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { UserRoles } from '../users/enum/roles.enum';

jest.mock('uuid', () => ({
  v4: () => 'uuid-mockado',
}));

describe('AuthService', () => {
  let authService: AuthService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersService: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let passwordService: PasswordService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  const mockUserResult = {
    uuid: 'user-123',
    email: 'test@techflow.com',
    password: '$argon2id$hash_super_seguro',
    role: UserRoles.CLIENT_ADMIN,
    enterprise: { uuid: 'enterprise-123' },
  };

  const mockUserMaster = {
    uuid: 'master-123',
    email: 'master@techflow.com',
    password: '$argon2id$hash_master',
    role: UserRoles.MASTER,
    enterprise: null,
  };

  const mockToken = 'jwt_token_criado_com_sucesso';

  const mockUsersService = {
    createUser: jest.fn(),
    findByMail: jest.fn(),
  };

  const mockPasswordService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockName('signAsync'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dto: RegisterUserDTO = {
        name: 'Test',
        email: 'test@email.com',
        password: '123',
        enterpriseId: '123',
      } as any;

      const responseDto = {
        uuid: '123',
        name: 'Test',
        email: 'test@email.com',
        createdAt: new Date(),
        role: UserRoles.CLIENT_VIEWER,
        enterpriseId: '123',
      };

      mockUsersService.createUser.mockResolvedValue(responseDto);

      const result = await authService.registerUser(dto);

      expect(result).toEqual(responseDto);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('loginUser', () => {
    const loginDto: LoginUserDTO = {
      email: 'test@techflow.com',
      password: 'password123',
    };

    it('should throw BadGatewayException if payload is empty', async () => {
      await expect(authService.loginUser({} as LoginUserDTO)).rejects.toThrow(
        BadGatewayException,
      );

      await expect(
        authService.loginUser(null as unknown as LoginUserDTO),
      ).rejects.toThrow(BadGatewayException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.findByMail.mockResolvedValue(null);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findByMail.mockResolvedValue(mockUserResult);
      mockPasswordService.verify.mockResolvedValue(false);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        mockUserResult.password,
        loginDto.password,
      );
    });

    it('should return access_token on successful login (Client User)', async () => {
      mockUsersService.findByMail.mockResolvedValue(mockUserResult);
      mockPasswordService.verify.mockResolvedValue(true);
      mockConfigService.get.mockReturnValue('https://api.test.com');
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await authService.loginUser(loginDto);

      expect(result).toEqual({ access_token: mockToken });

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUserResult.uuid,
          email: mockUserResult.email,
          role: mockUserResult.role,
          enterprise: mockUserResult.enterprise.uuid,
          iss: 'https://api.test.com',
        }),
      );
    });

    it('should return access_token with null enterprise for Master User', async () => {
      mockUsersService.findByMail.mockResolvedValue(mockUserMaster);
      mockPasswordService.verify.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      await authService.loginUser(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUserMaster.uuid,
          role: UserRoles.MASTER,
          enterprise: null,
        }),
      );
    });

    it('should use default ISS/AUD if config service returns null', async () => {
      mockUsersService.findByMail.mockResolvedValue(mockUserResult);
      mockPasswordService.verify.mockResolvedValue(true);
      mockConfigService.get.mockReturnValue(undefined);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      await authService.loginUser(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          iss: 'https://api.polofaculdades.com.br',
          aud: 'https://api.polofaculdades.com.br',
        }),
      );
    });

    it('should log error and throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.findByMail.mockResolvedValue(mockUserResult);
      mockPasswordService.verify.mockRejectedValue(new Error('Argon2 failed'));

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
