import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
export class UserResponseDTO {
  @IsUUID('4', { message: 'UUID must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'UUID is required.' })
  uuid: string;

  @IsString({ message: 'Name must be a valid text.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(80, { message: 'Name must be at most 80 characters long.' })
  name: string;

  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  @MaxLength(254, { message: 'Email must be at most 254 characters long.' })
  email: string;

  @IsNotEmpty({ message: 'Creation date is required.' })
  @IsDate({ message: 'Creation date must be a valid Date object.' })
  createdAt: Date;

  constructor(uuid: string, name: string, email: string, createdAt: Date) {
    this.uuid = uuid;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }
}
