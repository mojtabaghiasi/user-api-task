import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    example: 'test@test.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'The role of the user',
  })
  @IsEnum({ ADMIN: 'ADMIN', USER: 'USER' }, { message: 'Valid Role Required' })
  role: Role;
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  password: string;
  access_token?: string;
}
