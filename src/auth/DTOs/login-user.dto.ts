import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginUserDTO {
  @ApiProperty({
    description: 'Registered email for system access.',
    example: 'pedro@admin.com',
    format: 'email',
    maxLength: 254,
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email: string;

  @ApiProperty({
    description: 'User login password.',
    example: 'Pedro@2025',
    minLength: 12,
    maxLength: 72,
    format: 'password',
  })
  @IsString({ message: 'Password must be a valid text.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(12, { message: 'Password must be at least 12 characters long.' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long.' })
  password: string;
}
