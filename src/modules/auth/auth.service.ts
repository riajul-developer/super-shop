import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';  
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService) {}

  // Create a user
  async createUser(userDto: any): Promise<User> {
    const { name, email, password, roleId } = userDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database using Prisma
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      },
    });

    // Return the created user object
    return newUser;
  }

  // Validate user credentials
  async validateUserCredentials(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid credentials!',
        data: null,
        errors: null,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid credentials!',
        data: null,
        errors: null,
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  async generateToken(user: User): Promise<string> {
    const payload = { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });

    return token;
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
