import {
  Controller,
  Get,
  Req,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('users')
export class userController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    try {
      const user = await this.userService.getUserById(req.user.id);
      return {
        status: 'success',
        message: 'User data retrieved successfully',
        data: user,
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


  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(@Req() req) {
    return {
      status: 'success',
      message: 'User data retrieved successfully',
      data: req.user,
      errors: null,
    };
  }
}
