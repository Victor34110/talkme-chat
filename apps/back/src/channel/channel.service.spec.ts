import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { MemberService } from '../member/member.service';

describe('ChannelService', () => {
  let service: ChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: PrismaService,
          useValue: {
            channel: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            member: {
              findFirst: jest.fn(),
            },
            memberChannel: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: MemberService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a channel and a member-channel relation', async () => {
      const createChannelDto = { name: 'chan', server_id: '1' };
      const expectedChannel = { id: 'chan-1', ...createChannelDto };
      const expectedMember = { id: 'mem-1' };

      (service['prisma'].channel.create as jest.Mock).mockResolvedValue(
        expectedChannel,
      );
      (service['memberService'].findOne as jest.Mock).mockResolvedValue(
        expectedMember,
      );
      (service['prisma'].memberChannel.create as jest.Mock).mockResolvedValue(
        {},
      );

      const result = await service.create(createChannelDto, 'mem-1');
      expect(result).toEqual(expectedChannel);
    });

    it('should return undefined if member not found', async () => {
      (service['prisma'].channel.create as jest.Mock).mockResolvedValue({
        id: '1',
      });
      (service['memberService'].findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.create(
        { name: 'chan', server_id: '1' },
        'mem-1',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a channel', async () => {
      const channel = { id: '1' };
      (service['prisma'].channel.findFirst as jest.Mock).mockResolvedValue(
        channel,
      );
      const result = await service.findOne('1');
      expect(result).toEqual(channel);
    });
  });

  describe('update', () => {
    it('should return undefined if channel not found', async () => {
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      const result = await service.update('1', { name: 'new' }, 'user-1');
      expect(result).toBeUndefined();
    });

    it('should return undefined if user is not admin', async () => {
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        role: 'member',
      });
      const result = await service.update('1', { name: 'new' }, 'user-1');
      expect(result).toBeUndefined();
    });

    it('should update channel if user is admin', async () => {
      const channel = { id: '1', server_id: 'ser-1' };
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue(
        channel,
      );
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        role: 'admin',
      });
      (service['prisma'].channel.update as jest.Mock).mockResolvedValue({
        ...channel,
        name: 'new',
      });

      const result = await service.update('1', { name: 'new' }, 'user-1');
      expect(result).toBeDefined();
    });
  });

  describe('listMember', () => {
    it('should list users in a channel', async () => {
      const mockResult = [{ member: { user: { id: 'u1' } } }];
      (service['prisma'].memberChannel.findMany as jest.Mock).mockResolvedValue(
        mockResult,
      );
      const result = await service.listMember('1');
      expect(result).toEqual([{ id: 'u1' }]);
    });
  });

  describe('remove', () => {
    it('should return undefined if channel not found', async () => {
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      const result = await service.remove('1', 'u1');
      expect(result).toBeUndefined();
    });

    it('should return undefined if not admin', async () => {
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue({
        server_id: '1',
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        role: 'member',
      });
      const result = await service.remove('1', 'u1');
      expect(result).toBeUndefined();
    });

    it('should remove channel if user is admin', async () => {
      (service['prisma'].channel.findUnique as jest.Mock).mockResolvedValue({
        server_id: '1',
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        role: 'admin',
      });
      (
        service['prisma'].memberChannel.deleteMany as jest.Mock
      ).mockResolvedValue({});
      (service['prisma'].channel.delete as jest.Mock).mockResolvedValue({});

      await service.remove('1', 'u1');
      expect(service['prisma'].channel.delete).toHaveBeenCalled();
    });
  });

  describe('join methods', () => {
    it('join: should join a user to a channel', async () => {
      (service['prisma'].channel.findFirst as jest.Mock).mockResolvedValue({
        server_id: '1',
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'm1',
      }); // target user
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValueOnce({
        role: 'admin',
      }); // caller admin check
      (service['prisma'].memberChannel.create as jest.Mock).mockResolvedValue(
        {},
      );

      await service.join('target-u1', 'caller-u1', 'c1');
      expect(service['prisma'].memberChannel.create).toHaveBeenCalled();
    });
  });

  describe('leave', () => {
    it('should leave a channel', async () => {
      (service['prisma'].channel.findFirst as jest.Mock).mockResolvedValue({
        server_id: '1',
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        id: 'm1',
      });
      (
        service['prisma'].memberChannel.findFirst as jest.Mock
      ).mockResolvedValue({ id: 'mc1' });
      (service['prisma'].memberChannel.delete as jest.Mock).mockResolvedValue(
        {},
      );

      await service.leave('c1', 'u1');
      expect(service['prisma'].memberChannel.delete).toHaveBeenCalled();
    });
  });
});
