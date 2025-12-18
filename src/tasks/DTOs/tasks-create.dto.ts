import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDTO {
  @ApiProperty({
    description: 'Detailed description of the task to be performed.',
    example: 'Call client John to confirm the contract.',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'Description must be a valid string.' })
  @IsNotEmpty({ message: 'Task description is required.' })
  @MinLength(3, { message: 'Description must be at least 3 characters long.' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters.' })
  description: string;
}
