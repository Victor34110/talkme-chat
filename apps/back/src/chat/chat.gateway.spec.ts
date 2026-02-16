import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: PrismaService,
          useValue: {
            message: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock the wss server
    gateway.wss = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('chatToServer', () => {
    it('should save message and emit to room', async () => {
      const payload = { user_id: '1', channel_id: '1', message: 'hello' };
      const mockSavedMessage = {
        id: 'm1',
        content: 'hello',
        created_at: new Date(),
        user_id: '1',
        user: { name: 'test' },
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(mockSavedMessage);

      const mockSocket = { id: 's1' } as Socket;
      await gateway.handleChatMessage(mockSocket, payload);

      expect(prisma.message.create).toHaveBeenCalled();
      expect(gateway.wss.to).toHaveBeenCalledWith('channel_1');
      expect(gateway.wss.emit).toHaveBeenCalledWith(
        'chatToClient',
        expect.any(Object),
      );
    });
  });

  describe('rooms', () => {
    it('should handle joinRoom', () => {
      const mockSocket = {
        join: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
        data: { userId: 'u1' },
      } as any;
      gateway.handleJoinRoom(mockSocket, 'c1');
      expect(mockSocket.join).toHaveBeenCalledWith('channel_c1');
      expect(mockSocket.emit).toHaveBeenCalledWith('joinedRoom', 'c1');
    });

    it('should handle leaveRoom', () => {
      const mockSocket = {
        leave: jest.fn(),
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
        data: { userId: 'u1' },
      } as any;
      gateway.handleLeaveRoom(mockSocket, 'c1');
      expect(mockSocket.leave).toHaveBeenCalledWith('channel_c1');
      expect(mockSocket.emit).toHaveBeenCalledWith('leftRoom', 'c1');
    });
  });

  describe('typing', () => {
    it('should emit typing event to room', () => {
      const mockSocket = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
      gateway.handleTyping(mockSocket, { channel_id: 'c1', user_id: 'u1' });
      expect(mockSocket.to).toHaveBeenCalledWith('channel_c1');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'typing',
        expect.any(Object),
      );
    });

    it('should emit stopTyping event to room', () => {
      const mockSocket = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
      gateway.handleStopTyping(mockSocket, { channel_id: 'c1', user_id: 'u1' });
      expect(mockSocket.to).toHaveBeenCalledWith('channel_c1');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'stopTyping',
        expect.any(Object),
      );
    });
  });

  describe('message updates/deletes', () => {
    it('handleUpdateMessage should update and emit', async () => {
      const payload = {
        message_id: 'm1',
        channel_id: 'c1',
        message: 'new',
        user_id: 'u1',
      };
      (prisma.message.update as jest.Mock).mockResolvedValue({
        id: 'm1',
        content: 'new',
      });

      await gateway.handleUpdateMessage({} as any, payload);
      expect(prisma.message.update).toHaveBeenCalled();
      expect(gateway.wss.to).toHaveBeenCalledWith('channel_c1');
    });

    it('handleDeleteMessage should update and emit', async () => {
      const payload = { message_id: 'm1', channel_id: 'c1' };
      (prisma.message.update as jest.Mock).mockResolvedValue({
        id: 'm1',
        deleted: true,
      });

      await gateway.handleDeleteMessage({} as any, payload);
      expect(prisma.message.update).toHaveBeenCalled();
      expect(gateway.wss.to).toHaveBeenCalledWith('channel_c1');
    });
  });
});
