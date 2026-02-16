import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MemberService', () => {
  let service: MemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: PrismaService,
          useValue: {
            member: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            server: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a member', async () => {
      const createMemberDto = {
        name: 'test',
        role: 'member',
        server_id: '1',
        user_id: '1',
      };
      (service['prisma'].member.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...createMemberDto,
      });
      const result = await service.create(createMemberDto);
      expect(result).toEqual({ id: '1', ...createMemberDto });
    });
  });

  describe('findUser', () => {
    it('should return servers for a user', async () => {
      const servers = [{ id: '1' }];
      (service['prisma'].server.findMany as jest.Mock).mockResolvedValue(
        servers,
      );
      const result = await service.findUser('user-1');
      expect(result).toEqual(servers);
    });
  });

  describe('findOne', () => {
    it('should return a member', async () => {
      const member = { id: '1' };
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue(
        member,
      );
      const result = await service.findOne('1');
      expect(result).toEqual(member);
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      (service['prisma'].member.delete as jest.Mock).mockResolvedValue({});
      await service.remove('1');
      expect(service['prisma'].member.delete).toHaveBeenCalled();
    });
  });
});
