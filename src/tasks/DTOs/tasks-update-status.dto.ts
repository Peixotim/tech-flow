import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
export class UpdateStatusTaskDTO {
  @ApiPropertyOptional({
    description: 'Defines if the task is completed (true) or pending (false).',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'The status (isDone) must be a boolean value (true or false).',
  })
  isDone: boolean;
}
