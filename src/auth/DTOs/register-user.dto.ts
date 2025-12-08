import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDTO {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Pedro Peixoto',
    minLength: 3,
    maxLength: 80,
  })
  @IsString({ message: 'Name must be a valid text.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(80, { message: 'Name must be at most 80 characters long.' })
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail corporativo para login e notificações.',
    example: 'pedro@admin.com',
    maxLength: 254,
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email: string;

  @ApiProperty({
    description:
      'Senha forte de acesso (Recomendado: letras, números e símbolos).',
    example: 'PedroForte@2025',
    minLength: 12,
    maxLength: 72,
    format: 'password',
  })
  @IsString({ message: 'Password must be a valid text.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long.' })
  password: string;

  @ApiProperty({
    description:
      'Chave Mestra (Secret Key) para autorizar a criação de novos administradores.',
    example: 'Tecnicos_SuperSenha_2025!',
  })
  @IsString({ message: 'SecretKey must be a valid text.' })
  @IsNotEmpty({ message: 'Registration secret is required.' })
  secretKey: string;
}
