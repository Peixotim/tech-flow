import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EnterpriseCreateAndUserDTO {
  @ApiProperty({
    description: 'Razão social ou Nome Fantasia da empresa.',
    example: 'Escola Técnica Tech Flow Ltda',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'O nome da empresa deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'Identificador único (Slug/Sigla) para URL e rotas.',
    example: 'tech-flow-sp',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'O slug deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O slug é obrigatório.' })
  @MaxLength(50, { message: 'O slug deve ter no máximo 50 caracteres.' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'O slug deve conter apenas letras minúsculas, números e hífens (ex: minha-empresa).',
  })
  slug: string;

  @ApiProperty({
    description: 'CNPJ formatado da empresa.',
    example: '12.345.678/0001-90',
    minLength: 14,
    maxLength: 18,
  })
  @IsString({ message: 'O CNPJ deve ser um texto válido.' })
  @IsNotEmpty({ message: 'O CNPJ é obrigatório.' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'O CNPJ deve seguir o formato XX.XXX.XXX/XXXX-XX.',
  })
  cnpj: string;

  @ApiPropertyOptional({
    description: 'URL pública da logomarca da empresa.',
    example: 'https://tech-flow.com/assets/logo.png',
  })
  @IsOptional()
  @IsUrl(
    {},
    { message: 'A URL da logo deve ser um endereço HTTP/HTTPS válido.' },
  )
  @MaxLength(255, { message: 'A URL da logo é muito longa.' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description:
      'Cor primária da marca (Hexadecimal) para personalização do dashboard.',
    example: '#00Ddd0',
    default: '#000000',
  })
  @IsOptional()
  @IsHexColor({
    message:
      'A cor primária deve ser um código Hexadecimal válido (ex: #FFFFFF).',
  })
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Define se a empresa inicia ativa no sistema.',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'Pedro de Almeida Peixoto',
    minLength: 3,
    maxLength: 80,
  })
  @IsString({ message: 'Name must be a valid text.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(80, { message: 'Name must be at most 80 characters long.' })
  fullerName: string;

  @ApiProperty({
    description: 'E-mail corporativo único.',
    example: 'pedro@empresa.com',
    format: 'email',
    maxLength: 254,
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email: string;

  @ApiProperty({
    description: 'Senha de acesso.',
    example: 'SenhaForte@123',
    minLength: 12,
    maxLength: 72,
    format: 'password',
  })
  @IsString({ message: 'Password must be a valid text.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long.' })
  password: string;
}
