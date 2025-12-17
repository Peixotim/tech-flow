import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';
import { LeadStatus } from '../enums/lead-status.enum';

export class UpdateLeadDTO {
  @ApiPropertyOptional({
    enum: LeadStatus,
    description: 'New lead status (e.g., SCHEDULED, WON)',
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Monetary value associated (optional)' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Correcting the leads name.' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Date and time of scheduling (ISO 8601)',
    example: '2025-04-26T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'The scheduling date must be valid (ISO 8601).' },
  )
  scheduledAt?: string;

  @ApiPropertyOptional({
    description:
      'Notes regarding scheduling (Example: anchored value, interest)',
    example: 'Customers interested in the Pro plan, please call at 2 PM.',
  })
  @IsOptional()
  @IsString()
  scheduleNotes?: string;
}
