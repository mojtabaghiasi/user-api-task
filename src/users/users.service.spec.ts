import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { PasswordHelper } from '../common/helpers/password.helper';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';

describe('UsersService', () => {
  let usersService: UsersService;
  let databaseService: jest.Mocked<DatabaseService>;
  let passwordHelper: jest.Mocked<PasswordHelper>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: PasswordHelper,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    databaseService = module.get(DatabaseService);
    passwordHelper = module.get(PasswordHelper);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
        role: Role.USER,
      };

      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);
      passwordHelper.hashPassword.mockResolvedValue('hashedpassword');
      (databaseService.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...createUserDto,
      });

      const result = await usersService.create(createUserDto);
      expect(result).toEqual({
        id: 1,
        ...createUserDto,
      });
    });

    it('should throw ConflictException if user email already exists', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        password: 'hashedpassword',
      });

      await expect(
        usersService.create({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: Role.USER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: Role.USER },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: Role.ADMIN },
      ];
      (databaseService.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await usersService.findAll();
      expect(result).toEqual(users);
    });

    it('should return filtered users by role', async () => {
      const users = [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: Role.USER },
      ];
      (databaseService.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await usersService.findAll(Role.USER);
      expect(result).toEqual(users);
    });

    it('should throw NotFoundException if no users found', async () => {
      (databaseService.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(usersService.findAll(Role.USER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.USER,
      };
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await usersService.findOne(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(usersService.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto = { name: 'Updated Name', email: 'new@example.com' };
      const existingUser = {
        id: 1,
        name: 'John',
        email: 'old@example.com',
        role: Role.USER,
      };

      (databaseService.user.findUnique as jest.Mock).mockResolvedValueOnce(
        existingUser,
      );
      (databaseService.user.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      ); // Checking email uniqueness
      (databaseService.user.update as jest.Mock).mockResolvedValue({
        ...existingUser,
        ...updateUserDto,
      });

      const result = await usersService.update(1, updateUserDto);
      expect(result).toEqual({
        id: 1,
        name: 'Updated Name',
        email: 'new@example.com',
        role: Role.USER,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        usersService.update(99, { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new email is already in use', async () => {
      const existingUser = {
        id: 1,
        name: 'John',
        email: 'old@example.com',
        role: Role.USER,
      };
      (databaseService.user.findUnique as jest.Mock).mockResolvedValueOnce(
        existingUser,
      );
      (databaseService.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 2,
        email: 'new@example.com',
      });

      await expect(
        usersService.update(1, { email: 'new@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const user = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        role: Role.USER,
      };
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(user);
      (databaseService.user.delete as jest.Mock).mockResolvedValue(user);

      const result = await usersService.remove(1);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(usersService.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('ensureOwnershipOrAdmin', () => {
    it('should throw ForbiddenException if non-admin tries to modify another user', () => {
      const currentUser = { id: 2, role: Role.USER } as User;

      expect(() => usersService.ensureOwnershipOrAdmin(1, currentUser)).toThrow(
        ForbiddenException,
      );
    });

    it('should not throw if admin', () => {
      const currentUser = { id: 2, role: Role.ADMIN } as User;

      expect(() =>
        usersService.ensureOwnershipOrAdmin(1, currentUser),
      ).not.toThrow();
    });

    it('should not throw if modifying own data', () => {
      const currentUser = { id: 1, role: Role.USER } as User;

      expect(() =>
        usersService.ensureOwnershipOrAdmin(1, currentUser),
      ).not.toThrow();
    });
  });
});
