import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadsResponseDTO {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({ example: 'Pedro Peixoto' })
  name: string;

  @ApiPropertyOptional({ example: 'pedro@empresa.com' })
  email?: string;

  @ApiProperty({ example: '+37981853334' })
  number: string;

  @ApiProperty({
    description: 'ID da empresa vinculada',
    example: 'e4ead86b-c625-4084-b9a0-321a285feed4',
  })
  enterpriseId: string;
}
