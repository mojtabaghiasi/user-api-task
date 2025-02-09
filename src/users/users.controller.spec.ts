import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'test@test.com',
    password: 'hashedPassword',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    access_token: '',
  };

  const mockAdminUser: User = {
    ...mockUser,
    id: 2,
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    ensureOwnershipOrAdmin: jest.fn(),
    ensureNotSelfDeletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.spyOn(service, 'create'); // Ensures 'service' is being used
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'test@test.com',
        password: 'password123',
        role: Role.USER,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser, mockAdminUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });

    it('should return filtered users by role', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(Role.USER);
      expect(result).toEqual(users);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(Role.USER);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      const req = { user: mockUser };

      const result = await controller.findOne(1, req);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.ensureOwnershipOrAdmin).toHaveBeenCalledWith(
        1,
        mockUser,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);
      const req = { user: mockUser };

      const result = await controller.update(
        updatedUser.id,
        updateUserDto,
        req,
      );
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.ensureOwnershipOrAdmin).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(mockUser);
      const req = { user: mockAdminUser };

      const result = await controller.remove(1, req);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.ensureNotSelfDeletion).toHaveBeenCalledWith(
        1,
        mockAdminUser,
      );
    });
  });
});
