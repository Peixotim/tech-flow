import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoles } from '../enum/roles.enum';

export class UserCreateDTO {
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
  name: string;

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
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long.' })
  password: string;

  @ApiPropertyOptional({
    description: 'Nível de permissão do usuário.',
    enum: UserRoles,
    example: UserRoles.CLIENT_VIEWER,
    default: UserRoles.CLIENT_VIEWER,
  })
  @IsOptional()
  @IsEnum(UserRoles, { message: 'Invalid role provided.' })
  role?: UserRoles;

  @ApiProperty({
    description: 'UUID da empresa à qual este usuário pertence.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Enterprise ID is required.' })
  @IsUUID('4', { message: 'Enterprise ID must be a valid UUID.' })
  enterpriseId: string;
}
