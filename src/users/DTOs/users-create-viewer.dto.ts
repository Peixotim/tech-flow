import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserCreateViewerDTO {
  @ApiProperty({
    example: 'Pedro Peixoto',
    description: 'Name of the employee',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'pedro@techflow.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'strongPassword123', description: 'Password' })
  @IsString()
  @MinLength(6)
  password: string;
}
