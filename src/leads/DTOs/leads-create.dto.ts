import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsUUID,
} from 'class-validator';

export class LeadsCreateDTO {
  @ApiProperty({
    description: 'Lead full name.',
    example: 'Pedro de Almeida Peixoto',
    minLength: 3,
    maxLength: 80,
  })
  @IsString({ message: 'Name must be a valid text.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(80, { message: 'Name must be at most 80 characters long.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Lead email address.',
    example: 'pedro@lead.com',
    format: 'email',
    maxLength: 254,
  })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email?: string;

  @ApiProperty({
    description: 'Mobile phone number in international format (E.164).',
    example: '+5511987654321',
    minLength: 8,
    maxLength: 16,
    pattern: '^\\+[1-9]\\d{7,14}$',
  })
  @IsString({ message: 'Phone must be a valid text value.' })
  @IsNotEmpty({ message: 'Phone is required.' })
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message:
      'Phone must be a valid international number (E.164). Example: +5511987654321',
  })
  number: string;

  @ApiProperty({
    description: 'UUID of the enterprise to which this lead belongs.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Enterprise ID is required.' })
  @IsUUID('4', { message: 'Enterprise ID must be a valid UUID.' })
  enterpriseId: string;
}
