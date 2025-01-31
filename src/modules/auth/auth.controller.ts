import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  registerSchema,
  registerDataType,
  loginSchema,
  loginDataType,
} from './auth.schema';
import ValibotValidationPipe from '../../common/pipes/valibot.validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ValibotValidationPipe(registerSchema)) body: registerDataType,
  ) {
    const existingUser = await this.authService.findUserByEmail(body.email);
    if (existingUser) {
      throw new BadRequestException({
        status: 'error',
        message: 'Invalid input',
        data: null,
        errors: [
          {
            field: 'email',
            message: 'This email is already in use',
          },
        ],
      });
    }

    try {
      await this.authService.createUser(body);
      return {
        status: 'success',
        message: 'User registered successfully',
        data: null,
        errors: null,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong',
        data: null,
        errors: null,
      });
    }
  }

  @Post('login')
  async login(
    @Body(new ValibotValidationPipe(loginSchema)) body: loginDataType,
  ) {
    try {
      const { user } = await this.authService.validateUserCredentials(
        body.email,
        body.password,
      );

      const token = await this.authService.generateToken(user);

      return {
        status: 'success',
        message: 'Login successful',
        data: { token, user },
        errors: null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Something went wrong',
        data: null,
        errors: null,
      });
    }
  }
}
