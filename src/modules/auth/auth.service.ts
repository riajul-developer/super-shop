import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';  
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import {
  badErrorResponse,
  successResponse,
} from 'src/common/utils/response.util';

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService) {}

  // Create a user
  async createUser(userData: any) {
    const { name, email, password, roleId } = userData;
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      badErrorResponse('',[
        {
          field: 'email',
          message: 'This email is already in use',
        },
      ]);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
    });
    return successResponse('User registered successfully');
  }

  async validateUserCredentials(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      badErrorResponse('Invalid credentials!');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      badErrorResponse('Invalid credentials!');
    }
    const role = user.role ? user.role.name : null;
    const permissions =
      user.role?.rolePermission.map((rp) => rp.permission.name) || [];
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      permissions,
    });
  
    return successResponse('Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  }
  
  async generateToken(payload: any): Promise<string> {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Update user information
  async updateUser(id: number, userDto: any): Promise<User> {
    const { name, email, password, roleId } = userDto;

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
    });

    return updatedUser;
  }

  // Delete user
  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
