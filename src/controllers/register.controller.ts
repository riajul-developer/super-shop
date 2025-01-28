import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { registerSchema, registerDataType } from '../schemas/users.schema';
import ValidationPipe from '../common/validation.pipe'; 

@Controller('register')
export class RegisterController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  uploadFormData(
    @Body(new ValidationPipe(registerSchema)) body: registerDataType,
  ) {

    return {
      message: 'Form data and file uploaded successfully',
      data: {
        name: body.name,
        email: body.email,
      },
    };
  }
}
