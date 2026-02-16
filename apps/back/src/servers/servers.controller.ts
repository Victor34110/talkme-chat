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
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { MemberService } from 'src/member/member.service';
import { UpdateMemberDto } from 'src/member/dto/update-member.dto';
import { CreateChannelDto } from 'src/channel/dto/create-channel.dto';
import { UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from 'src/auth/auth.guard';
import { UserId } from '../user/user-id.decorator';

@UseGuards(BetterAuthGuard)
@Controller('servers')
export class ServersController {
  constructor(
    private readonly serversService: ServersService,
    private readonly memberService: MemberService,
  ) {}

  @Post()
  async create(
    @Body() createServerDto: CreateServerDto,
    @UserId() userId: string,
  ) {
    return this.serversService.create(createServerDto, userId);
  }

  @Get()
  async findAll(
    @Body() createServerDto: CreateServerDto,
    @UserId() userId: string,
  ) {
    return this.memberService.findUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serversService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateServerDto: UpdateServerDto,
    @UserId() userId: string,
  ) {
    return this.serversService.update(id, updateServerDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.serversService.remove(id, userId);
  }

  @Post(':id/join')
  join(
    @Body('user_id') id: string,
    @UserId() userId: string,
    @Body('role') role: string,
    @Body('serverId') serverId: string,
  ) {
    return this.serversService.join(id, userId, role, serverId);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @UserId() userId: string) {
    return this.serversService.leave(id, userId);
  }

  @Get(':id/members')
  listMember(@Param('id') id: string) {
    return this.serversService.listMember(id);
  }

  @Put(':id/members/:userId')
  updateRoles(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.serversService.updateRoles(id, userId, updateMemberDto);
  }

  @Post(':id/channels')
  createChannel(
    @Param('id') id: string,
    @Body() createChannelDto: CreateChannelDto,
    @UserId() userId: string,
  ) {
    return this.serversService.createChannel(id, createChannelDto, userId);
  }

  @Get(':id/channels')
  listChannel(@Param('id') id: string) {
    return this.serversService.listChannel(id);
  }
}
