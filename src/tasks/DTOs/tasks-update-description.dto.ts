import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength, IsString } from 'class-validator';
export class UpdateDescriptionTaskDTO {
  @ApiPropertyOptional({
    description: 'Update the task description.',
    example: 'Call client John (Urgent).',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a valid string.' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters.' })
  description: string;
}
