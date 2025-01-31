import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './config/prisma.module';
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
@Module({
  imports: [PrismaModule, AuthModule, UserModule, PermissionModule, RoleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
