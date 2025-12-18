import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({ example: 'SenhaAntiga123!' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty({ example: 'NovaSenhaForte@2025' })
  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(20)
  newPassword: string;
}
