import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { userController } from './user.controller';

@Module({
  controllers: [userController],
  providers: [UserService],
})
export class UserModule {}
