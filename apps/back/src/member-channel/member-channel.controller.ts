import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MemberChannelService } from './member-channel.service';
import { CreateMemberChannelDto } from './dto/create-member-channel.dto';
import { UpdateMemberChannelDto } from './dto/update-member-channel.dto';

@Controller('member-channel')
export class MemberChannelController {}
