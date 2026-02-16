import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberModule } from 'src/member/member.module';
import { UserModule } from 'src/user/user.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [MemberModule, UserModule, ChannelModule],
  controllers: [ServersController],
  providers: [ServersService, PrismaService],
})
export class ServersModule {}
