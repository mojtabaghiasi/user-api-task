import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PasswordHelper } from '../common/helpers/password.helper';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly passwordHelper: PasswordHelper,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (
      user &&
      (await this.passwordHelper.comparePassword(pass, user.password))
    ) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    await this.usersService.update(user.id, {
      access_token: accessToken,
    });
    return {
      access_token: accessToken,
    };
  }

  async register(user: CreateUserDto) {
    await this.usersService.create(user);
  }
}
