import { Test, TestingModule } from '@nestjs/testing';
import { ServersService } from './servers.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { ChannelService } from '../channel/channel.service';

describe('ServersService', () => {
  let service: ServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServersService,
        {
          provide: PrismaService,
          useValue: {
            server: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            member: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            memberChannel: {
              deleteMany: jest.fn(),
            },
            channel: {
              deleteMany: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ChannelService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServersService>(ServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a server and its first member as owner', async () => {
      const createServerDto = { name: 'Test Server' };
      const userId = 'user-1';
      const expectedServer = { id: 'server-1', name: 'Test Server' };
      const expectedUser = { id: 'user-1', name: 'Test User' };

      (service['prismaService'].server.create as jest.Mock).mockResolvedValue(
        expectedServer,
      );
      (service['userService'].findOne as jest.Mock).mockResolvedValue(
        expectedUser,
      );
      (service['prismaService'].member.create as jest.Mock).mockResolvedValue(
        {},
      );

      const result = await service.create(createServerDto, userId);

      expect(result).toEqual(expectedServer);
      expect(service['prismaService'].member.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'owner' }),
        }),
      );
    });

    it('should return undefined if user not found', async () => {
      const createServerDto = { name: 'Test Server' };
      const userId = 'user-1';
      (service['prismaService'].server.create as jest.Mock).mockResolvedValue({
        id: 'server-1',
      });
      (service['userService'].findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.create(createServerDto, userId);
      expect(result).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a server', async () => {
      const expectedServer = { id: '1' };
      (
        service['prismaService'].server.findFirst as jest.Mock
      ).mockResolvedValue(expectedServer);
      const result = await service.findOne('1');
      expect(result).toEqual(expectedServer);
    });
  });

  describe('update', () => {
    it('should update server if user is admin or owner', async () => {
      const updateServerDto = { name: 'New Name' };
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'admin' });
      (service['prismaService'].server.update as jest.Mock).mockResolvedValue({
        id: '1',
        ...updateServerDto,
      });

      const result = await service.update('1', updateServerDto, 'user-1');
      expect(result).toBeDefined();
    });

    it('should return undefined if not admin/owner', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'member' });
      const result = await service.update('1', {}, 'user-1');
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove server if user is admin or owner', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'owner' });
      (service['prismaService'].$transaction as jest.Mock).mockResolvedValue([
        {},
        {},
        {},
        {},
      ]);

      await service.remove('1', 'user-1');
      expect(service['prismaService'].$transaction).toHaveBeenCalled();
    });
  });

  describe('join', () => {
    it('should add user to server as member if caller is admin/owner', async () => {
      const user = { name: 'Test User' };
      (service['userService'].findOne as jest.Mock).mockResolvedValue(user);
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'admin' });
      (service['prismaService'].member.create as jest.Mock).mockResolvedValue({
        id: 'mem-1',
      });

      await service.join('target-u-id', 'caller-u-id', 'member', 's1');
      expect(service['prismaService'].member.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'member' }),
        }),
      );
    });
  });

  describe('leave', () => {
    it('should remove member from server', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ id: 'mem-1' });
      (service['prismaService'].member.delete as jest.Mock).mockResolvedValue(
        {},
      );

      await service.leave('1', 'user-1');
      expect(service['prismaService'].member.delete).toHaveBeenCalled();
    });
  });

  describe('listMember', () => {
    it('should list members of a server', async () => {
      const members = [{ user: { id: '1' } }, { user: { id: '2' } }];
      (service['prismaService'].member.findMany as jest.Mock).mockResolvedValue(
        members,
      );

      const result = await service.listMember('1');
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('updateRoles', () => {
    it('should update role if caller is owner', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'owner' });
      (service['prismaService'].member.update as jest.Mock).mockResolvedValue(
        {},
      );

      await service.updateRoles('1', 'caller-id', { role: 'admin' });
      expect(service['prismaService'].member.update).toHaveBeenCalled();
    });

    it('should not update role if caller is not owner', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ role: 'admin' });
      const result = await service.updateRoles('1', 'caller-id', {
        role: 'admin',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('createChannel', () => {
    it('should create a channel if user is admin or owner', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ id: 'mem-1', role: 'admin' });
      (service['channelService'].create as jest.Mock).mockResolvedValue({
        id: 'chan-1',
      });

      const result = await service.createChannel(
        '1',
        { name: 'chan', server_id: '1' },
        'user-1',
      );
      expect(result).toEqual({ id: 'chan-1' });
    });

    it('should not create channel if user is member', async () => {
      (
        service['prismaService'].member.findFirst as jest.Mock
      ).mockResolvedValue({ id: 'mem-1', role: 'member' });
      const result = await service.createChannel(
        '1',
        { name: 'chan', server_id: '1' },
        'u-1',
      );
      expect(result).toBeUndefined();
    });
  });

  describe('listChannel', () => {
    it('should list channels', async () => {
      (
        service['prismaService'].channel.findMany as jest.Mock
      ).mockResolvedValue([{ id: '1' }]);
      const result = await service.listChannel('1');
      expect(result).toEqual([{ id: '1' }]);
    });
  });
});
