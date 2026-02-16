import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { UpdateMemberDto } from 'src/member/dto/update-member.dto';
import { Prisma } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()
export class ServersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}

  async create(createServerDto: CreateServerDto, userId: string) {
    const data: Prisma.ServerCreateInput = { ...createServerDto };
    const server = this.prismaService.server.create({ data });
    const user = await this.userService.findOne(userId);

    if (!user) return;
    await this.prismaService.member.create({
      data: {
        server_id: (await server).id,
        user_id: userId,
        name: user.name,
        role: 'owner',
      },
    });
    return server;
  }

  async findOne(id: string) {
    return this.prismaService.server.findFirst({ where: { id } });
  }

  async update(id: string, updateServerDto: UpdateServerDto, userId: string) {
    const data: Prisma.ServerUpdateInput = { ...updateServerDto };
    const member = await this.prismaService.member.findFirst({
      where: {
        server_id: id,
        user_id: userId,
      },
    });

    if (!member || !['admin', 'owner'].includes(member.role)) return;
    return this.prismaService.server.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const member = await this.prismaService.member.findFirst({
      where: {
        server_id: id,
        user_id: userId,
      },
    });

    if (!member || !['admin', 'owner'].includes(member.role)) return;

    return this.prismaService.$transaction([
      this.prismaService.memberChannel.deleteMany({
        where: {
          channel: {
            server_id: id,
          },
        },
      }),

      this.prismaService.channel.deleteMany({
        where: { server_id: id },
      }),

      this.prismaService.member.deleteMany({
        where: { server_id: id },
      }),

      this.prismaService.server.delete({
        where: { id },
      }),
    ]);
  }

  async join(id: string, userId: string, role: string, serverId: string) {
    const user = await this.userService.findOne(id);
    const member = await this.prismaService.member.findFirst({
      where: {
        server_id: serverId,
        user_id: userId,
      },
    });
    if (!user || !member || !['admin', 'owner'].includes(member.role)) return;
    return this.prismaService.member.create({
      data: {
        server_id: serverId,
        user_id: id,
        name: user.name,
        role: role || 'member',
      },
    });
  }

  async leave(id: string, userId: string) {
    const member = await this.prismaService.member.findFirst({
      where: {
        server_id: id,
        user_id: userId,
      },
    });
    if (!member) return;
    await this.prismaService.memberChannel.deleteMany({
      where: {
        channel: {
          server_id: id,
        },
        member_id: member?.id,
      },
    });
    return this.prismaService.member.delete({
      where: {
        id: member.id,
      },
    });
  }

  async listMember(id: string) {
    const result = await this.prismaService.member.findMany({
      where: { server_id: id },
      include: {
        user: true,
      },
    });
    return result.map((r: any) => r.user);
  }

  async updateRoles(
    id: string,
    userId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    const data: Prisma.MemberUpdateInput = { ...updateMemberDto };
    const member = await this.prismaService.member.findFirst({
      where: {
        server_id: id,
        user_id: userId,
      },
    });

    if (!member || member.role !== 'owner') return;
    return this.prismaService.member.update({
      where: { id: member.id },
      data,
    });
  }

  async createChannel(
    id: string,
    createChannelDto: CreateChannelDto,
    userId: string,
  ) {
    const member = await this.prismaService.member.findFirst({
      where: {
        user_id: userId,
        server_id: id,
      },
    });
    const data = {
      ...createChannelDto,
      server_id: id,
    };
    if (!member || !['admin', 'owner'].includes(member.role)) return;
    return this.channelService.create(data, member.id);
  }

  async listChannel(id: string) {
    return this.prismaService.channel.findMany({
      where: {
        server_id: id,
      },
    });
  }
}
