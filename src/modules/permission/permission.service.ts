import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all permissions
  async getAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
