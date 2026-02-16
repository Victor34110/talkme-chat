import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from 'src/auth/auth.guard';
import { UserId } from '../user/user-id.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@UseGuards(BetterAuthGuard)
@Controller('me')
export class MeController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  me() {}
  @Get(':id')
  async meserver(@Param('id') serverId: string, @UserId() userId: string) {
    return this.prisma.member.findFirst({
      where: {
        user_id: userId,
        server_id: serverId,
      },
    });
  }
}
