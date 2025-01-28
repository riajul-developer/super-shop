import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { RegisterController } from '../controllers/register.controller';

@Module({
  controllers: [RegisterController],
  providers: [UsersService]
})
export class UsersModule {}
