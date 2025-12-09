import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnterpriseResponseDTO {
  @ApiProperty({
    description: 'Identificador único universal da empresa (UUID).',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  uuid: string;

  @ApiProperty({
    description: 'Razão social ou Nome Fantasia.',
    example: 'Escola Técnica Tech Flow Ltda',
  })
  name: string;

  @ApiProperty({
    description: 'Identificador único (Slug) para uso em URLs.',
    example: 'tech-flow-sp',
  })
  slug: string;

  @ApiProperty({
    description: 'CNPJ formatado.',
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @ApiPropertyOptional({
    description: 'URL pública da logomarca (pode ser nulo se não configurado).',
    example: 'https://tech-flow.com/assets/logo.png',
    nullable: true,
  })
  logoUrl: string | null;

  @ApiProperty({
    description: 'Cor primária da marca (Hex) para personalização do frontend.',
    example: '#000000',
  })
  primaryColor: string;

  @ApiProperty({
    description: 'Indica se a empresa está ativa e pode acessar a plataforma.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data e hora em que a empresa foi registrada.',
    example: '2025-12-09T14:30:00.000Z',
  })
  createdAt: Date;
}
