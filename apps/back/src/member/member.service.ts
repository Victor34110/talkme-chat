import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { Prisma } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const data: Prisma.MemberCreateInput = { ...createMemberDto };
    return this.prisma.member.create({ data });
  }

  findUser(userId: string) {
    return this.prisma.server.findMany({
      where: {
        members: {
          some: {
            user_id: userId,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.member.findFirst({ where: { id } });
  }

  async remove(id: string) {
    return this.prisma.member.delete({ where: { id } });
  }
}
