import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import {
  badErrorResponse,
  createdResponse,
  notFoundResponse,
  serverErrorResponse,
  successResponse,
} from 'src/common/utils/response.util';
import {
  calculatePagination,
  paginateData,
} from 'src/common/utils/pagination.util';
import { CreateCartType, UpdateCartType } from './cart.schema';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Add to cart
  async addToCart(
    cartData: CreateCartType & {
      userId: number;
    },
  ) {
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        id: cartData.productId,
      },
    });

    if (!existingProduct) {
      badErrorResponse('', [
        {
          field: 'productId',
          message: 'Invalid product ID',
        },
      ]);
    }

    if (existingProduct.stock < cartData.quantity) {
      return badErrorResponse('', [
        {
          field: 'quantity',
          message: `Only ${existingProduct.stock} item(s) available in stock`,
        },
      ]);
    }

    const existingCartItem = await this.prisma.cart.findFirst({
      where: {
        userId: cartData.userId,
        productId: cartData.productId,
      },
    });

    if (existingCartItem) {
      badErrorResponse('', [
        {
          field: 'productId',
          message: 'Product already exists in cart',
        },
      ]);
    }

    await this.prisma.cart.create({
      data: {
        userId: cartData.userId,
        productId: cartData.productId,
        quantity: cartData.quantity,
      },
    });

    return createdResponse('Product added to cart successfully', null);
  }

  // Update Cart Quantity
  async updateCartItem(cartData: UpdateCartType, cartId: number) {
    const cartItem = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { product: true },
    });
    if (!cartItem) {
      return notFoundResponse('Cart item not found');
    }
    if (cartItem.product.stock < cartData.quantity) {
      return badErrorResponse('', [
        {
          field: 'quantity',
          message: `Only ${cartItem.product.stock} item(s) available in stock`,
        },
      ]);
    }
    await this.prisma.cart.update({
      where: { id: cartId },
      data: cartData,
    });
    return successResponse('Cart item updated successfully');
  }

  // // Get User's Cart Items
  async getUserCart(
    page: string,
    limit: string,
    baseUrl: string,
    userId: number,
  ) {
    const { validPage, validLimit, skip } = await calculatePagination(
      page,
      limit,
    );

    const cartItems = await this.prisma.cart.findMany({
      where: { userId },
      take: validLimit,
      skip: skip,
      include: {
        product: true,
      },
    });

    if (!cartItems.length) {
      return notFoundResponse('Cart is empty');
    }

    const totalCount = await this.prisma.cart.aggregate({
      _count: { id: true }, 
      where: { userId },
    });
  
    const total = totalCount._count.id;

    const pagination = paginateData(validPage, validLimit, total, baseUrl);

    return successResponse('Cart retrieved successfully', {
      cartItems,
      pagination,
    });
  }

  // Remove Product from Cart
  async removeCartItem(cartId: number, userId: number) {
    const cartItem = await this.prisma.cart.findUnique({
      where: { id: cartId, userId },
    });

    if (!cartItem) {
      return notFoundResponse('Cart item not found');
    }

    await this.prisma.cart.delete({
      where: { id: cartId },
    });

    return successResponse('Cart item removed successfully');
  }

  // Clear User's Cart
  async clearUserCart(userId: number) {
    await this.prisma.cart.deleteMany({
      where: { userId },
    });
    return successResponse('Cart cleared successfully');
  }
}
