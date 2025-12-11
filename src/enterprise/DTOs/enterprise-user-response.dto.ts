import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnterpriseResponseCreateAndUser {
  // --- USER DATA ---
  @ApiProperty({
    description: 'Unique UUID of the created admin user.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userUuid: string;

  @ApiProperty({
    description: 'Full name of the admin user.',
    example: 'Pedro Peixoto',
  })
  userName: string;

  @ApiProperty({
    description: 'Admin user email address.',
    example: 'pedro@techflow.com',
  })
  email: string;

  @ApiProperty({
    description: 'Timestamp when the account was created.',
    example: '2025-12-09T10:00:00.000Z',
  })
  createdAt: Date;

  // --- ENTERPRISE DATA ---
  @ApiProperty({
    description: 'Unique UUID of the created enterprise.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  enterpriseUuid: string;

  @ApiProperty({
    description: 'Official company name (Razão Social or Trade Name).',
    example: 'Tech Flow Education Ltda',
  })
  enterpriseName: string;

  @ApiProperty({
    description: 'Unique URL slug identifier.',
    example: 'tech-flow-sp',
  })
  slug: string;

  @ApiProperty({
    description: 'Formatted CNPJ document.',
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @ApiPropertyOptional({
    description: 'Public URL of the company logo (can be null).',
    example: 'https://cdn.techflow.com/assets/logo.png',
    nullable: true,
  })
  logoUrl: string | null;

  @ApiProperty({
    description: 'Primary brand color (Hex) for dashboard customization.',
    example: '#1A73E8',
  })
  primaryColor: string;

  @ApiProperty({
    description: 'Indicates if the enterprise account is active.',
    example: true,
  })
  isActive: boolean;
}
