import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { MessagesService } from 'src/messages/messages.service';
import { UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from 'src/auth/auth.guard';
import { UserId } from '../user/user-id.decorator';

@UseGuards(BetterAuthGuard)
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly messageService: MessagesService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(id);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.channelService.findUser(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
    @UserId() userId: string,
  ) {
    return this.channelService.update(id, updateChannelDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.channelService.remove(id, userId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
    @UserId() userId: string,
  ) {
    createMessageDto.channel_id = id;
    createMessageDto.user_id = userId;
    return this.messageService.create(createMessageDto);
  }

  @Get(':id/messages')
  messageHistory(@Param('id') id: string) {
    return this.messageService.messageHistory(id);
  }

  @Get(':id/members')
  listMember(@Param('id') id: string) {
    return this.channelService.listMember(id);
  }

  @Post(':id/join')
  join(
    @Body('user_id') id: string,
    @UserId() userId: string,
    @Body('channelId') channelId: string,
  ) {
    return this.channelService.join(id, userId, channelId);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @UserId() userId: string) {
    return this.channelService.leave(id, userId);
  }
}
