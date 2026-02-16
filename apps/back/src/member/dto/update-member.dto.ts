import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  name?: string | undefined;
  role?: string | undefined;
  ban?: boolean;
  unban?: Date;
}
