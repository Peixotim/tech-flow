import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseCreateDTO } from './DTOs/enterprise-create.dto';
import { BadRequestException } from '@nestjs/common';

describe('EnterpriseController', () => {
  let controller: EnterpriseController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: jest.Mocked<EnterpriseService>;

  const mockService = {
    createEnterprise: jest.fn(),
  };

  const defaultDTO: EnterpriseCreateDTO = {
    name: 'Empresa X',
    cnpj: '12345678000199',
    slug: 'empresa-x',
  };

  const responseMock = {
    uuid: 'uuid-123',
    ...defaultDTO,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterpriseController],
      providers: [
        {
          provide: EnterpriseService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EnterpriseController>(EnterpriseController);
    service = module.get<EnterpriseService>(
      EnterpriseService,
    ) as jest.Mocked<EnterpriseService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Deve criar enterprise com sucesso', async () => {
    mockService.createEnterprise.mockResolvedValue(responseMock);

    const result = await controller.createEnterprise(defaultDTO);

    expect(result).toEqual(responseMock);
    expect(mockService.createEnterprise).toHaveBeenCalledTimes(1);
    expect(mockService.createEnterprise).toHaveBeenCalledWith(defaultDTO);
  });

  it('Deve propagar erro vindo do service', async () => {
    mockService.createEnterprise.mockRejectedValue(
      new BadRequestException('Invalid payload'),
    );

    await expect(controller.createEnterprise(defaultDTO)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockService.createEnterprise).toHaveBeenCalled();
  });
});
