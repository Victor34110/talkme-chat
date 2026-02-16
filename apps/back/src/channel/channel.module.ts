import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { MemberModule } from 'src/member/member.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [MemberModule, MessagesModule],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
