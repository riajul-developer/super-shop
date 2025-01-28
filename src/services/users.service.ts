import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';  
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
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
        roleId, // Optional roleId, if provided
      },
    });

    // Return the created user object
    return newUser;
  }

  // Validate user credentials
  async validateUserCredentials(email: string, password: string): Promise<any> {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    // Compare the given password with the stored password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return { user }; 
    }

    return { message: 'Invalid credentials' };
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

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

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
