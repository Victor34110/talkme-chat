import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UseGuards } from '@nestjs/common';
import { BetterAuthGuard } from 'src/auth/auth.guard';
import { UserId } from '../user/user-id.decorator';

@UseGuards(BetterAuthGuard)
@Controller('messages')
export class MessagesController {
  //tmp en attente de betterauth
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @UserId() userId: string,
  ) {
    return this.messagesService.update(id, updateMessageDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userId: string) {
    return this.messagesService.remove(id, userId);
  }
}
