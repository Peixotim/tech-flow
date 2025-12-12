import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateEnrollmentDTO {
  @ApiProperty({
    description: 'UUID of the Lead to be enrolled',
    example: 'f50bb3c0-9cef-46a8-bf3d-b0f5d2d40d13',
  })
  @IsUUID('4', { message: 'leadId must be a valid UUID' })
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({
    description: 'Total value of the enrollment/sale',
    example: 2000.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    description: 'Name of the course or service',
    example: 'Fullstack Developer',
  })
  @IsString()
  @IsNotEmpty()
  courseName: string;
}
