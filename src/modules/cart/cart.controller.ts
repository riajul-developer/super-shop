import {
  Controller,
  Body,
  Post,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import PermissionGuard from 'src/common/guards/permission.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import {
  CreateCartType,
  UpdateCartType,
  createCartSchema,
  updateCartSchema,
} from './cart.schema';
import { CartService } from './cart.service';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { FastifyRequest } from 'fastify';
import BaseUrl from 'src/common/utils/base-url.util';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // create cart
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(new ValibotValidationPipe(createCartSchema)) body: CreateCartType,
    @Req() req: AuthenticatedRequest,
  ) {
    const pipe = new ValibotValidationPipe(createCartSchema);
    const validatedData = pipe.transform(body);
    const userId = req.user?.id;
    return this.cartService.addToCart({ ...validatedData, userId });
  }

  // update cart item
  @Patch('update/:cartId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('cartId') cartId: string,
    @Body(new ValibotValidationPipe(updateCartSchema)) body: UpdateCartType,
  ) {
    const pipe = new ValibotValidationPipe(updateCartSchema);
    const validatedData = pipe.transform(body);

    return this.cartService.updateCartItem(validatedData, Number(cartId));
  }

  // Get All Categories
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCartItems(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const baseUrl = BaseUrl(req, '/carts');

    const userId = req.user?.id;

    return this.cartService.getUserCart(page, limit, baseUrl, userId);
  }

  // Remove cart item
  @Delete('remove/:cartId')
  @UseGuards(JwtAuthGuard)
  async removeCartItem(
    @Param('cartId') cartId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;

    return this.cartService.removeCartItem(Number(cartId), userId);
  }

  // Clear User's Cart 
  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return await this.cartService.clearUserCart(userId);
  }

}
