import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoles } from '../enum/roles.enum';
import type { AvatarConfig } from '../types/users-avatar-config.types';

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
    description: 'CNPJ da empresa vinculada',
    example: '40.432.544/0001-47',
  })
  enterpriseCnpj: string;

  // --- NOVOS CAMPOS ---
  @ApiPropertyOptional({
    description: 'Configuração visual do avatar 3D',
    example: { characterId: 'ninja', background: 'bg-zinc-900', aura: 'fire' },
  })
  avatarConfig?: AvatarConfig;

  @ApiPropertyOptional({ description: 'Nível atual do usuário', example: 5 })
  level?: number;

  @ApiPropertyOptional({ description: 'Experiência acumulada', example: 1250 })
  experiencePoints?: number;

  @ApiPropertyOptional({
    description: 'Itens desbloqueados',
    example: ['ninja', 'fire'],
  })
  unlockedItems?: string[];
}
