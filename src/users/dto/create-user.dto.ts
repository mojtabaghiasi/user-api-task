import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { UserRoles } from '../entities/user.roles';

export class CreateUserDto extends UserEntity {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsEnum({ ADMIN: 'ADMIN', USER: 'USER' }, { message: 'Valid Role Required' })
  role: UserRoles;
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  password: string;
}
