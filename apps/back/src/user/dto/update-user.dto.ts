import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  username: string;
  password: string;
  email: string;
  avatar_url?: string;
  birthday?: string;
}
