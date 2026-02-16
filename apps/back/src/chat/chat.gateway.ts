import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.2.120:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly prisma: PrismaService) {}
  private onlineUsersByChannel: Map<string, Set<string>> = new Map();

  afterInit(server: any) {
    this.logger.log('ChatGateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.data.userId = userId;
    this.logger.log(`Client connected: ${client.id} with userId: ${userId}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    this.onlineUsersByChannel.forEach((set, channelId) => {
      if (set.has(client.data.userId)) {
        set.delete(client.data.userId);
        this.wss
          .to(`channel_${channelId}`)
          .emit('userLeft', { user_id: client.data.userId });
      }
    });
  }

  @SubscribeMessage('chatToServer')
  async handleChatMessage(
    client: Socket,
    payload: { user_id: string; channel_id: string; message: string },
  ) {
    try {
      const savedMessage = await this.prisma.message.create({
        data: {
          content: payload.message,
          user_id: payload.user_id,
          channel_id: payload.channel_id,
        },
        include: { user: true },
      });
      this.wss.to(`channel_${payload.channel_id}`).emit('chatToClient', {
        id: savedMessage.id,
        content: savedMessage.content,
        created_at: savedMessage.created_at,
        user_id: savedMessage.user_id,
        username: savedMessage.user?.name,
      });
    } catch (err) {
      return;
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, channel_id: string) {
    const roomName = `channel_${channel_id}`;
    client.join(roomName);
    if (!this.onlineUsersByChannel.has(channel_id)) {
      this.onlineUsersByChannel.set(channel_id, new Set());
    }

    this.onlineUsersByChannel.get(channel_id)!.add(client.data.userId);
    client.to(roomName).emit('userJoined', { user_id: client.data.userId });

    const onlineUserIds = Array.from(
      this.onlineUsersByChannel.get(channel_id)!,
    );
    client.emit('getOnlineUsers', onlineUserIds);

    client.emit('joinedRoom', channel_id);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, channel_id: string) {
    const roomName = `channel_${channel_id}`;
    client.leave(roomName);

    this.onlineUsersByChannel.get(channel_id)?.delete(client.data.userId);

    client.to(roomName).emit('userLeft', { user_id: client.data.userId });
    client.emit('leftRoom', channel_id);
  }

  @SubscribeMessage('typing')
  handleTyping(
    client: Socket,
    payload: { channel_id: string; user_id: string },
  ) {
    const roomName = `channel_${payload.channel_id}`;
    client.to(roomName).emit('typing', {
      channel_id: payload.channel_id,
      user_id: payload.user_id,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    client: Socket,
    payload: { channel_id: string; user_id: string },
  ) {
    const roomName = `channel_${payload.channel_id}`;
    client.to(roomName).emit('stopTyping', {
      channel_id: payload.channel_id,
      user_id: payload.user_id,
    });
  }

  @SubscribeMessage('messageUpdated')
  async handleUpdateMessage(
    client: Socket,
    payload: {
      message_id: string;
      channel_id: string;
      message: string;
      user_id: string;
    },
  ) {
    this.logger.log(payload);
    try {
      const savedMessage = await this.prisma.message.update({
        where: { id: payload.message_id },
        data: {
          content: payload.message,
        },
        include: { user: true },
      });

      this.wss.to(`channel_${payload.channel_id}`).emit('messageUpdated', {
        id: savedMessage.id,
        content: savedMessage.content,
        created_at: savedMessage.created_at,
        user_id: savedMessage.user_id,
        username: savedMessage.user?.name,
      });
    } catch (err) {
      return;
    }
  }

  @SubscribeMessage('messageDelete')
  async handleDeleteMessage(
    client: Socket,
    payload: { message_id: string; channel_id: string },
  ) {
    this.logger.log(payload);
    try {
      const savedMessage = await this.prisma.message.update({
        where: { id: payload.message_id },
        data: { deleted: true },
        include: { user: true },
      });

      this.wss.to(`channel_${payload.channel_id}`).emit('messageDelete', {
        id: savedMessage.id,
        content: savedMessage.content,
        created_at: savedMessage.created_at,
        user_id: savedMessage.user_id,
        username: savedMessage.user?.name,
      });
    } catch (err) {
      return;
    }
  }
}
