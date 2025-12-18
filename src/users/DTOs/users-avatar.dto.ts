import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAvatarDTO {
  @ApiProperty({
    description: 'ID of the selected 3D character asset',
    example: 'tech_man_1',
  })
  @IsString({ message: 'Character ID must be a valid string.' })
  @IsNotEmpty({ message: 'Character ID is required.' })
  characterId: string;

  @ApiProperty({
    description: 'Background identifier or CSS class',
    example: 'bg-zinc-900',
  })
  @IsString({ message: 'Background must be a valid string.' })
  @IsNotEmpty({ message: 'Background is required.' })
  background: string;

  @ApiPropertyOptional({
    description: 'Special visual effect ID',
    example: 'glow',
    default: 'none',
  })
  @IsOptional()
  @IsString({ message: 'Aura must be a valid string.' })
  aura?: string;
}
