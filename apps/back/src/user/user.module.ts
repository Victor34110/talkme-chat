import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MeController } from './me.controller';

@Module({
  controllers: [UserController, MeController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
