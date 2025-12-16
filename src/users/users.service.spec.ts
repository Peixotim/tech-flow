import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersEntity } from './entity/users.entity';
import { PasswordService } from '../crypto/password.service';
import { EnterpriseService } from 'src/enterprise/enterprise.service';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserCreateDTO } from './DTOs/users-create.dto';
import { UserRoles } from './enum/roles.enum';
import { EnterpriseEntity } from 'src/enterprise/enterprise/enterprise.entity';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let usersRepository: Repository<UsersEntity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let passwordService: PasswordService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let enterpriseService: EnterpriseService;

  const mockEnterprise: EnterpriseEntity = {
    uuid: 'enterprise-uuid',
    name: 'Tech Flow',
    slug: 'tech-flow',
    cnpj: '00000000000000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
    users: [],
    logoUrl: 'qualquerLogo',
    primaryColor: '#000000',
    leads: [],
    enrollments: [],
  };

  const mockUserCreateDTO: UserCreateDTO = {
    name: 'João Developer',
    email: 'joao@techflow.com',
    password: 'password123',
    enterpriseCnpj: 'enterprise-cnpj',
    role: UserRoles.CLIENT_ADMIN,
  };

  const mockUserEntity: UsersEntity = {
    uuid: 'user-uuid',
    name: 'João Developer',
    email: 'joao@techflow.com',
    password: 'hashed_password',
    role: UserRoles.CLIENT_ADMIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    enterprise: mockEnterprise,
  };
  const mockUsersRepository = {
    exists: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPasswordService = {
    hash: jest.fn(),
  };

  const mockEnterpriseService = {
    findByUuid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: EnterpriseService,
          useValue: mockEnterpriseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    passwordService = module.get<PasswordService>(PasswordService);
    enterpriseService = module.get<EnterpriseService>(EnterpriseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockUsersRepository.exists.mockResolvedValue(false);
      mockEnterpriseService.findByUuid.mockResolvedValue(mockEnterprise);
      mockPasswordService.hash.mockResolvedValue('hashed_password');
      mockUsersRepository.create.mockReturnValue(mockUserEntity);
      mockUsersRepository.save.mockResolvedValue(mockUserEntity);

      const result = await service.createUser(mockUserCreateDTO);
      expect(result).toEqual({
        uuid: mockUserEntity.uuid,
        name: mockUserEntity.name,
        email: mockUserEntity.email,
        createdAt: mockUserEntity.createdAt,
        role: mockUserEntity.role,
        enterpriseId: mockEnterprise.uuid,
      });
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
      expect(mockPasswordService.hash).toHaveBeenCalledWith(
        mockUserCreateDTO.password,
      );
    });

    it('should throw BadRequestException if payload is empty', async () => {
      await expect(
        service.createUser({} as unknown as UserCreateDTO),
      ).rejects.toThrow(BadRequestException);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await expect(service.createUser(null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockUsersRepository.exists.mockResolvedValue(true);

      await expect(service.createUser(mockUserCreateDTO)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if enterprise does not exist', async () => {
      mockUsersRepository.exists.mockResolvedValue(false);
      mockEnterpriseService.findByUuid.mockResolvedValue(null); // Empresa não encontrada

      await expect(service.createUser(mockUserCreateDTO)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException on database unique constraint error (23505)', async () => {
      mockUsersRepository.exists.mockResolvedValue(false);
      mockEnterpriseService.findByUuid.mockResolvedValue(mockEnterprise);
      mockPasswordService.hash.mockResolvedValue('hashed_password');
      mockUsersRepository.create.mockReturnValue(mockUserEntity);

      const dbError = { code: '23505', message: 'Unique violation' };
      mockUsersRepository.save.mockRejectedValue(dbError);

      await expect(service.createUser(mockUserCreateDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on unexpected database error', async () => {
      mockUsersRepository.exists.mockResolvedValue(false);
      mockEnterpriseService.findByUuid.mockResolvedValue(mockEnterprise);
      mockPasswordService.hash.mockResolvedValue('hashed_password');
      mockUsersRepository.create.mockReturnValue(mockUserEntity);

      const unexpectedError = new Error('Database went down');
      mockUsersRepository.save.mockRejectedValue(unexpectedError);

      await expect(service.createUser(mockUserCreateDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByMail', () => {
    it('should return a user with enterprise relation and specific selects', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await service.findByMail('joao@techflow.com');

      expect(result).toEqual(mockUserEntity);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'joao@techflow.com' },
        relations: ['enterprise'],
        select: {
          uuid: true,
          name: true,
          email: true,
          password: true,
          role: true,
          isActive: true,
          enterprise: {
            uuid: true,
          },
        },
      });
    });

    it('should return null if user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.findByMail('notfound@techflow.com');

      expect(result).toBeNull();
    });
  });
});
