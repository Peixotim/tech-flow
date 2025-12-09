import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseService } from './enterprise.service';
import { Repository } from 'typeorm';
import { EnterpriseEntity } from './enterprise/enterprise.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';

describe('EnterpriseService', () => {
  let service: EnterpriseService;
  let repository: jest.Mocked<Repository<EnterpriseEntity>>;

  const mockRepository = {
    findOne: jest.fn(() => {}),
    save: jest.fn(() => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseService,
        {
          provide: getRepositoryToken(EnterpriseEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EnterpriseService>(EnterpriseService);
    repository = module.get(getRepositoryToken(EnterpriseEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultDTO: EnterpriseCreateDTO = {
    name: 'Empresa X',
    cnpj: '12345678000199',
    slug: 'empresa-x',
  };

  const mockEnterpriseEntity = {
    uuid: 'uuid-123',
    ...defaultDTO,
  } as EnterpriseEntity;

  it('Deve criar uma empresa com sucesso', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.save.mockResolvedValue(mockEnterpriseEntity);

    const result = await service.createEnterprise(defaultDTO);

    expect(result).toEqual(mockEnterpriseEntity);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining(defaultDTO),
    );
  });

  it('Deve lançar erro se payload estiver vazio', async () => {
    await expect(
      service.createEnterprise({} as EnterpriseCreateDTO),
    ).rejects.toThrow(BadRequestException);
  });

  it('Deve lançar erro se CNPJ já existir', async () => {
    repository.findOne.mockResolvedValueOnce(mockEnterpriseEntity);

    await expect(service.createEnterprise(defaultDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it('Deve lançar erro se Slug já existir', async () => {
    repository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockEnterpriseEntity);

    await expect(service.createEnterprise(defaultDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it('Deve lançar erro 500 para erro genérico do banco', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.save.mockRejectedValue(new Error('DB ERROR'));

    await expect(service.createEnterprise(defaultDTO)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('Deve lançar erro de conflito se receber code 23505', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.save.mockRejectedValue({ code: '23505' });

    await expect(service.createEnterprise(defaultDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it('findByUuid deve retornar entidade', async () => {
    repository.findOne.mockResolvedValue(mockEnterpriseEntity);

    const result = await service.findByUuid('uuid-123');

    expect(result).toEqual(mockEnterpriseEntity);
  });

  it('findByUuid deve retornar null se não existir', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.findByUuid('uuid-x');

    expect(result).toBeNull();
  });

  it('findByCnpj deve retornar entidade', async () => {
    repository.findOne.mockResolvedValue(mockEnterpriseEntity);

    const result = await service.findByCnpj(defaultDTO.cnpj);

    expect(result).toEqual(mockEnterpriseEntity);
  });

  it('findByCnpj deve retornar null', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.findByCnpj('cnpj');

    expect(result).toBeNull();
  });

  it('findBySlug deve retornar entidade', async () => {
    repository.findOne.mockResolvedValue(mockEnterpriseEntity);

    const result = await service.findBySlug(defaultDTO.slug);

    expect(result).toEqual(mockEnterpriseEntity);
  });

  it('findBySlug deve retornar null', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await service.findBySlug('slug');

    expect(result).toBeNull();
  });
});
