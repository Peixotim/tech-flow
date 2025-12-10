import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoles } from '../enum/roles.enum';
export class UsersResponseDTO {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({ example: 'Pedro Peixoto' })
  name: string;

  @ApiProperty({ example: 'pedro@empresa.com' })
  email: string;

  @ApiProperty({ example: '2025-12-09T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ enum: UserRoles, example: UserRoles.CLIENT_VIEWER })
  role?: UserRoles;

  @ApiProperty({
    description: 'ID da empresa vinculada',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  enterpriseId: string;
}
