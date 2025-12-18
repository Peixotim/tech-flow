import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDTO {
  @ApiProperty({
    description: 'Unique identifier of the task (UUID).',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  uuid: string;

  @ApiProperty({
    description: 'Detailed description of the task.',
    example: 'Follow up with the new lead via WhatsApp.',
  })
  description: string;

  @ApiProperty({
    description:
      'Indicates if the task is completed (true) or pending (false).',
    example: false,
  })
  isDone: boolean;

  @ApiProperty({
    description: 'Date and time when the task was created (ISO 8601).',
    example: '2025-10-26T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time of the last update (ISO 8601).',
    example: '2025-10-27T14:30:00.000Z',
  })
  updatedAt: Date;
}
