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
import { CreateCartType } from './cart.schema';

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

  // // Get User's Cart Items
  // async getUserCart(userId: number, page: number, limit: number, baseUrl: string) {
  //   const { validPage, validLimit, skip, total } = await calculatePagination(
  //     this.prisma.cart,
  //     page,
  //     limit,
  //     { where: { userId } },
  //   );

  //   const cartItems = await this.prisma.cart.findMany({
  //     where: { userId },
  //     take: validLimit,
  //     skip: skip,
  //     include: {
  //       product: true,
  //     },
  //   });

  //   if (!cartItems.length) {
  //     return notFoundResponse('Cart is empty');
  //   }

  //   const pagination = paginateData(validPage, validLimit, total, baseUrl);

  //   return successResponse('Cart retrieved successfully', {
  //     cartItems,
  //     pagination,
  //   });
  // }

  // // Update Cart Quantity
  // async updateCartItem(cartId: number, quantity: number) {
  //   try {
  //     const cartItem = await this.prisma.cart.findUnique({
  //       where: { id: cartId },
  //     });

  //     if (!cartItem) {
  //       return notFoundResponse('Cart item not found');
  //     }

  //     await this.prisma.cart.update({
  //       where: { id: cartId },
  //       data: { quantity },
  //     });

  //     return successResponse('Cart item updated successfully');
  //   } catch (error) {
  //     return serverErrorResponse('Failed to update cart item');
  //   }
  // }

  // // Remove Product from Cart
  // async removeCartItem(cartId: number) {
  //   try {
  //     const cartItem = await this.prisma.cart.findUnique({
  //       where: { id: cartId },
  //     });

  //     if (!cartItem) {
  //       return notFoundResponse('Cart item not found');
  //     }

  //     await this.prisma.cart.delete({
  //       where: { id: cartId },
  //     });

  //     return successResponse('Cart item removed successfully');
  //   } catch (error) {
  //     return serverErrorResponse('Failed to remove cart item');
  //   }
  // }

  // // Clear User's Cart
  // async clearUserCart(userId: number) {
  //   try {
  //     await this.prisma.cart.deleteMany({
  //       where: { userId },
  //     });

  //     return successResponse('Cart cleared successfully');
  //   } catch (error) {
  //     return serverErrorResponse('Failed to clear cart');
  //   }
  // }
}
