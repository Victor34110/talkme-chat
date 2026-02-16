import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberChannelDto } from './create-member-channel.dto';

export class UpdateMemberChannelDto extends PartialType(
  CreateMemberChannelDto,
) {
  ban: boolean;
  unban: Date;
}
