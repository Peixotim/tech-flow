import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoles } from 'src/users/enum/roles.enum';

export class RegisterUserDTO {
  @ApiProperty({
    description: 'User full name.',
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
    description: 'Corporate email address for login and notifications.',
    example: 'pedro@admin.com',
    maxLength: 254,
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email: string;

  @ApiProperty({
    description:
      'Strong access password (Recommended: letters, numbers, and symbols).',
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

  @ApiPropertyOptional({
    description: 'User permission level (Role).',
    enum: UserRoles,
    example: UserRoles.CLIENT_VIEWER,
    default: UserRoles.CLIENT_VIEWER,
  })
  @IsOptional()
  @IsEnum(UserRoles, { message: 'Invalid role provided.' })
  role?: UserRoles;

  @ApiProperty({
    description: 'CNPJ of the enterprise to which this user belongs.',
    example: '60.409.075/0001-52',
  })
  @IsNotEmpty({ message: 'Enterprise CNPJ is required.' })
  enterpriseCnpj: string;
}
