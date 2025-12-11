import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadsResponseDTO {
  @ApiProperty({
    description: 'Unique lead ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Lead full name',
    example: 'Pedro Peixoto',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Lead email address',
    example: 'pedro@company.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Lead phone number',
    example: '+5511987654321',
  })
  number: string;

  @ApiProperty({
    description: 'ID of the associated enterprise',
    example: 'e4ead86b-c625-4084-b9a0-321a285feed4',
  })
  enterpriseId: string;

  @ApiProperty({
    description: 'Date and time the lead was registered.',
    example: '2025-12-09T14:30:00.000Z',
  })
  createdAt: Date;
}
