import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword?: string,
  ): Promise<boolean> {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(password, hashedPassword);
  }

  ensureOwnershipOrAdmin(userId: number, currentUser: User) {
    if (currentUser.role !== Role.ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException(
        'You are not authorised to perform this action',
      );
    }
  }

  ensureNotSelfDeletion(userId: number, currentUser: User) {
    if (currentUser.id === userId) {
      throw new ForbiddenException('You cannot delete yourself');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
    createUserDto.password = await this.hashPassword(createUserDto.password);
    return this.databaseService.user.create({
      data: createUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findAll(role?: 'ADMIN' | 'USER') {
    if (role) {
      const users = await this.databaseService.user.findMany({
        where: {
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      if (users.length === 0) {
        throw new NotFoundException('User not found');
      }
      return users;
    }
    return this.databaseService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user ? { ...user, role: user.role } : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUserById = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!existingUserById) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto.email) {
      const existingUser = await this.databaseService.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists.');
      }
    }
    const hashedPassword = updateUserDto.password
      ? await this.hashPassword(updateUserDto.password)
      : undefined;
    if (hashedPassword) {
      updateUserDto.password = hashedPassword;
    }
    return this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async remove(id: number) {
    const existingUserById = await this.databaseService.user.findUnique({
      where: { id },
    });
    if (!existingUserById) {
      throw new NotFoundException('User not found');
    }
    return this.databaseService.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }
}
