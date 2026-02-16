import { Module } from '@nestjs/common';
import { MemberChannelService } from './member-channel.service';
import { MemberChannelController } from './member-channel.controller';

@Module({
  exports: [MemberChannelService],
  controllers: [MemberChannelController],
  providers: [MemberChannelService],
})
export class MemberChannelModule {}
