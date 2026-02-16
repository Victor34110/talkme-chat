import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            member: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const createMessageDto = {
        content: 'hello',
        channel_id: '1',
        user_id: '1',
      };
      (service['prisma'].message.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...createMessageDto,
      });
      const result = await service.create(createMessageDto);
      expect(result).toEqual({ id: '1', ...createMessageDto });
    });
  });

  describe('update', () => {
    it('should update message if user is author', async () => {
      const message = { id: '1', user_id: 'user-1', content: 'old' };
      (service['prisma'].message.findUnique as jest.Mock).mockResolvedValue(
        message,
      );
      (service['prisma'].message.update as jest.Mock).mockResolvedValue({
        ...message,
        content: 'new',
        modify: true,
      });

      const result = await service.update('1', { content: 'new' }, 'user-1');
      expect(result!.content).toBe('new');
      expect(result!.modify).toBe(true);
    });

    it('should return undefined if user is not author', async () => {
      (service['prisma'].message.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'other',
      });
      const result = await service.update('1', { content: 'new' }, 'user-1');
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should mark message as deleted if user is author', async () => {
      (service['prisma'].message.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        user_id: 'user-1',
        channel: { server_id: '1' },
      });
      (service['prisma'].message.update as jest.Mock).mockResolvedValue({
        id: '1',
        content: '',
        deleted: true,
      });

      const result = await service.remove('1', 'user-1');
      expect(result!.deleted).toBe(true);
      expect(result!.content).toBe('');
    });

    it('should mark message as deleted if user is admin', async () => {
      (service['prisma'].message.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        user_id: 'other',
        channel: { server_id: '1' },
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue({
        role: 'admin',
      });
      (service['prisma'].message.update as jest.Mock).mockResolvedValue({
        id: '1',
        content: '',
        deleted: true,
      });

      const result = await service.remove('1', 'admin-id');
      expect(result!.deleted).toBe(true);
    });

    it('should return undefined if user is not author nor admin', async () => {
      (service['prisma'].message.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        user_id: 'other',
        channel: { server_id: '1' },
      });
      (service['prisma'].member.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.remove('1', 'user-id');
      expect(result).toBeUndefined();
    });
  });

  describe('messageHistory', () => {
    it('should return messages for a channel', async () => {
      const messages = [{ id: '1' }, { id: '2' }];
      (service['prisma'].message.findMany as jest.Mock).mockResolvedValue(
        messages,
      );
      const result = await service.messageHistory('1');
      expect(result).toEqual(messages);
    });
  });
});
