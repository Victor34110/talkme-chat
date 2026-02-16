import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@repo/types';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMessageDto: CreateMessageDto) {
    const data: Prisma.MessageCreateInput = { ...createMessageDto };
    return this.prisma.message.create({ data });
  }

  async update(id: string, updateMessageDto: UpdateMessageDto, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });

    if (!message) return;
    if (message.user_id !== userId) return;
    return this.prisma.message.update({
      where: { id },
      data: {
        content: updateMessageDto.content,
        modify: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!message) return;

    if (message.user_id !== userId) {
      if (!message.channel) return;
      const member = await this.prisma.member.findFirst({
        where: {
          user_id: userId,
          server_id: message.channel.server_id,
          role: { in: ['admin', 'owner'] },
        },
      });
      if (!member) return;
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        content: '',
        deleted: true,
      },
    });
  }

  messageHistory(id: string) {
    return this.prisma.message.findMany({ where: { channel_id: id } });
  }
}
