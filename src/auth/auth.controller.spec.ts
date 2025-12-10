/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.services';
import { RegisterUserDTO } from './DTOs/register-user.dto';
import { LoginUserDTO } from './DTOs/login-user.dto';
import { UsersResponseDTO } from '../users/DTOs/user-create-response.dto';
import { UserRoles } from '../users/enum/roles.enum';

jest.mock('uuid', () => ({
  v4: () => 'uuid-mockado',
}));

describe('AuthController', () => {
  let controller: AuthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let authService: AuthService;

  const mockUserResponse: UsersResponseDTO = {
    uuid: 'user-uuid-123',
    name: 'Pedro Teste',
    email: 'pedro@test.com',
    createdAt: new Date(),
    role: UserRoles.CLIENT_ADMIN,
    enterpriseId: 'enterprise-uuid',
  };

  const mockTokenResponse = {
    access_token: 'jwt_token_exemplo',
  };

  const mockAuthService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should call authService.registerUser with correct parameters and return user', async () => {
      const registerDto: RegisterUserDTO = {
        name: 'Pedro Teste',
        email: 'pedro@test.com',
        password: 'Password123!',
        enterpriseId: 'enterprise-uuid',
      } as RegisterUserDTO; // Cast para evitar erro se faltar campos opcionais no mock

      // Ensinamos o Mock a retornar sucesso
      mockAuthService.registerUser.mockResolvedValue(mockUserResponse);

      // Act (Ação)
      const result: UsersResponseDTO =
        await controller.registerUser(registerDto);

      expect(result).toEqual(mockUserResponse); // O retorno é igual ao do service?
      expect(mockAuthService.registerUser).toHaveBeenCalledTimes(1); // Foi chamado 1 vez?
      expect(mockAuthService.registerUser).toHaveBeenCalledWith(registerDto); // Foi chamado com o DTO certo?
    });
  });

  describe('loginUser', () => {
    it('should call authService.loginUser and return access token', async () => {
      // Arrange
      const loginDto: LoginUserDTO = {
        email: 'pedro@test.com',
        password: 'Password123!',
      };

      mockAuthService.loginUser.mockResolvedValue(mockTokenResponse);

      // Act
      const result = await controller.loginUser(loginDto);

      // Assert
      expect(result).toEqual(mockTokenResponse);
      expect(mockAuthService.loginUser).toHaveBeenCalledTimes(1);
      expect(mockAuthService.loginUser).toHaveBeenCalledWith(loginDto);
    });
  });
});
