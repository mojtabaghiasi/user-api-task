import {
  IsEmail,
  IsEnum,
  IsJWT,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsEnum({ ADMIN: 'ADMIN', USER: 'USER' }, { message: 'Valid Role Required' })
  role: 'ADMIN' | 'USER';
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  password: string;
  @IsString()
  @IsJWT()
  accessToken: string;
}
