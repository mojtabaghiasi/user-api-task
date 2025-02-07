import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async create(createUserDto: CreateUserDto) {
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
    return this.databaseService.user.findUnique({
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

  async findOneByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
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
