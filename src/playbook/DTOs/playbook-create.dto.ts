import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { PlaybookType } from '../enums/playbook-type.enum';

export class CreatePlaybookDTO {
  @ApiProperty({
    description:
      'The main title of the playbook item (Script, Template, or File).',
    example: 'Cold Call Intro - 2025',
    maxLength: 150,
  })
  @IsString({ message: 'Title must be a valid string.' })
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters.' })
  title: string;

  @ApiProperty({
    description:
      'A tag or category to organize the content (e.g., Prospecting, Closing).',
    example: 'Prospecting',
    maxLength: 50,
  })
  @IsString({ message: 'Category must be a valid string.' })
  @IsNotEmpty({ message: 'Category is required.' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters.' })
  category: string;

  @ApiProperty({
    description: 'The type of content being created.',
    enum: PlaybookType,
    example: PlaybookType.SCRIPT,
  })
  @IsEnum(PlaybookType, { message: 'Invalid playbook type.' })
  type: PlaybookType;

  @ApiPropertyOptional({
    description: 'The actual text content for Scripts or WhatsApp Templates.',
    example: 'Hello [Name], I noticed you downloaded our ebook...',
  })
  @IsOptional()
  @IsString({ message: 'Content must be a valid string.' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Pro tips or context on how/when to use this script.',
    example: 'Keep a steady tone and pause after the question.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Tips must be a valid string.' })
  @MaxLength(255, { message: 'Tips cannot exceed 255 characters.' })
  tips?: string;

  @ApiPropertyOptional({
    description: 'URL of the attached file (required if type is MATERIAL).',
    example: 'https://s3.amazonaws.com/bucket/presentation.pdf',
  })
  @IsOptional()
  @IsString({ message: 'File URL must be a valid string.' })
  fileUrl?: string;

  @ApiPropertyOptional({
    description: 'The extension or type of the file.',
    example: 'PDF',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'File type must be a string.' })
  fileType?: string;

  @ApiPropertyOptional({
    description: 'Human-readable file size.',
    example: '2.5 MB',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'File size must be a string.' })
  fileSize?: string;

  @ApiPropertyOptional({
    description:
      'Defines if the content is visible only to the author (true) or the whole company (false).',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isPrivate must be a boolean value.' })
  isPrivate?: boolean;
}
