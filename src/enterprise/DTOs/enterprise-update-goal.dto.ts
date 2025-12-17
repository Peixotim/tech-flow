import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateGoalDTO {
  @ApiProperty({
    description: 'New monthly revenue target',
    example: 50000.0,
  })
  @IsNumber()
  @Min(0)
  goal: number;
}
