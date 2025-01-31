import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Find user by ID
  async getUserById(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword; 
  }
}
