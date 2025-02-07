import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (
      user &&
      (await this.usersService.comparePassword(pass, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: UserEntity) {
    const payload = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
