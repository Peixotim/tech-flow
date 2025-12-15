import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { LeadStatus } from '../enums/lead-status.enum';

export class UpdateLeadDTO {
  @ApiPropertyOptional({
    enum: LeadStatus,
    description: 'New status for the lead',
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
