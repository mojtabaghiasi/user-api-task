import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordHelper } from '../common/helpers/password.helper';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let passwordHelper: jest.Mocked<PasswordHelper>;

  beforeEach(async () => {
    const mockUsersService = {
      findOneByEmail: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockPasswordHelper = {
      comparePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PasswordHelper, useValue: mockPasswordHelper },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    passwordHelper = module.get(PasswordHelper);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'test@test.com',
        password: 'hashedpassword',
        role: 'USER',
        access_token: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findOneByEmail.mockResolvedValue(mockUser);
      passwordHelper.comparePassword.mockResolvedValue(true);

      const result = await authService.validateUser(
        mockUser.email,
        'password123',
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(passwordHelper.comparePassword).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if credentials are invalid', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await authService.validateUser(
        'wrong@test.com',
        'password123',
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        'wrong@test.com',
      );
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'test@test.com',
        password: 'hashedpassword',
        role: 'USER',
        access_token: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findOneByEmail.mockResolvedValue(mockUser);
      passwordHelper.comparePassword.mockResolvedValue(false);

      const result = await authService.validateUser(
        mockUser.email,
        'wrongpassword',
      );

      expect(passwordHelper.comparePassword).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a JWT token and return it', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'test@test.com',
        password: 'hashedpassword',
        role: 'USER',
        access_token: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt-token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });

      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, {
        access_token: mockToken,
      });

      expect(result).toEqual({ access_token: mockToken });
    });
  });
});
