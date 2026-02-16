import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Prisma } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberService } from 'src/member/member.service';
import { channel } from 'diagnostics_channel';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly memberService: MemberService,
  ) {}

  async create(createChannelDto: CreateChannelDto, memberId: string) {
    const data: Prisma.ChannelCreateInput = { ...createChannelDto };
    const channel = await this.prisma.channel.create({ data });
    const member = await this.memberService.findOne(memberId);

    if (!member) return;
    await this.prisma.memberChannel.create({
      data: {
        channel_id: channel.id,
        member_id: member.id,
      },
    });
    return channel;
  }

  findUser(userId: string) {
    return this.prisma.channel.findMany({
      where: {
        members: {
          some: {
            member: {
              user_id: userId,
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.channel.findFirst({ where: { id } });
  }

  async update(id: string, updateChannelDto: UpdateChannelDto, userId: string) {
    const data: Prisma.ChannelUpdateInput = { ...updateChannelDto };
    const channel = await this.prisma.channel.findUnique({ where: { id } });

    if (!channel) {
      return;
    }
    const member = await this.prisma.member.findFirst({
      where: {
        user_id: userId,
        server_id: channel.server_id,
      },
    });
    if (!member || member.role !== 'admin') {
      return;
    }
    return this.prisma.channel.update({
      where: { id },
      data,
    });
  }
  async listMember(id: string) {
    const result = await this.prisma.memberChannel.findMany({
      where: { channel_id: id },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });
    return result.map((r) => r.member.user);
  }

  async remove(id: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({ where: { id } });

    if (!channel) {
      return;
    }
    const member = await this.prisma.member.findFirst({
      where: {
        user_id: userId,
        server_id: channel.server_id,
      },
    });
    if (!member || member.role !== 'admin') {
      return;
    }
    await this.prisma.memberChannel.deleteMany({ where: { channel_id: id } });
    return this.prisma.channel.delete({ where: { id } });
  }

  async join(id: string, userId: string, channel_id: string) {
    const channel = await this.findOne(channel_id);
    const user = await this.prisma.member.findFirst({
      where: {
        server_id: channel?.server_id,
        user_id: id,
      },
    });
    const memberCurrent = await this.prisma.member.findFirst({
      where: {
        server_id: channel?.server_id,
        user_id: userId,
      },
    });
    if (!user || !memberCurrent || memberCurrent.role != 'admin') return;
    return this.prisma.memberChannel.create({
      data: {
        channel_id: channel_id,
        member_id: user.id,
      },
    });
  }

  async leave(id: string, userId: string) {
    const channel = await this.findOne(id);
    const member = await this.prisma.member.findFirst({
      where: {
        server_id: channel?.server_id,
        user_id: userId,
      },
    });
    const memberChannel = await this.prisma.memberChannel.findFirst({
      where: {
        channel_id: id,
        member_id: member?.id,
      },
    });

    if (!memberChannel) return;
    return this.prisma.memberChannel.delete({
      where: {
        id: memberChannel.id,
      },
    });
  }
}
