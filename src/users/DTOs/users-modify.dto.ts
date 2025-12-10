import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UsersModifyDTO {
  @ApiPropertyOptional({
    description: 'Updated user full name.',
    example: 'Pedro Peixoto',
    minLength: 3,
    maxLength: 80,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a valid text.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(80, { message: 'Name must be at most 80 characters long.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated corporate email address.',
    example: 'pedro.update@admin.com',
    format: 'email',
    maxLength: 254,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email?: string;
}
