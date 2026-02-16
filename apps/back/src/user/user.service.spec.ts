import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a user', async () => {
      const createUserDto = {
        username: 'test',
        email: 'test@test.com',
        avatar_url: 'url',
        password: 'password',
      };
      const expectedUser = {
        id: 'uuid',
        name: 'test',
        email: 'test@test.com',
        image: 'url',
      };
      (service['prisma'].user.create as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await service.signup(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(service['prisma'].user.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers = [{ id: '1' }, { id: '2' }];
      (service['prisma'].user.findMany as jest.Mock).mockResolvedValue(
        expectedUsers,
      );

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedUser = { id: '1' };
      (service['prisma'].user.findUnique as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await service.findOne('1');
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'updated',
        username: 'updated',
        password: 'password',
        email: 'test@test.com',
      };
      const expectedUser = { id: '1', name: 'updated' };
      (service['prisma'].user.update as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await service.update('1', updateUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedUser = { id: '1' };
      (service['prisma'].user.delete as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await service.remove('1');
      expect(result).toEqual(expectedUser);
    });
  });
});
