import { Controller, Post, Body } from '@nestjs/common';
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
  register(
    @Body(new ValibotValidationPipe(registerSchema)) body: registerDataType,
  ) {
    return this.authService.createUser(body);
  }

  @Post('login')
  login(@Body(new ValibotValidationPipe(loginSchema)) body: loginDataType) {
    return this.authService.validateUserCredentials(body.email, body.password);
  }
}
