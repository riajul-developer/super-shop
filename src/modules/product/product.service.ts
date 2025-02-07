import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import {
  badErrorResponse,
  createdResponse,
  notFoundResponse,
  successResponse,
} from 'src/common/utils/response.util';
import { paginateData } from 'src/common/utils/pagination.util';
import { CreateProductType } from './product.schema';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new product
  async createProduct(productData: CreateProductType) {
    await this.prisma.product.create({
      data: {
        sellerId: productData.sellPrice,
        categoryId: productData.categoryId || null,
        name: productData.name,
        desc: productData.desc || null,
        regularPrice: productData.regularPrice || null,
        sellPrice: productData.sellPrice,
        stock: productData.stock,
        imageUrl: productData.mainImage as unknown as string,
      },
    });

    return createdResponse('Product created successfully', null);
  }

  // Get all products with pagination
//   async getAllProducts(page: number = 1, limit: number = 10, baseUrl: string) {
//     const skip = (page - 1) * limit;
//     const total = await this.prisma.product.count();

//     const products = await this.prisma.product.findMany({
//       take: limit,
//       skip,
//       include: {
//         category: true,
//         seller: true,
//         productImages: true,
//       },
//     });

//     if (!products.length) {
//       return notFoundResponse('No products found');
//     }

//     const pagination = paginateData(page, limit, total, baseUrl);

//     return successResponse('Products retrieved successfully', {
//       products,
//       pagination,
//     });
//   }

  // Get a product by ID
//   async getProductById(productId: number) {
//     const product = await this.prisma.product.findUnique({
//       where: { id: Number(productId) },
//       include: {
//         category: true,
//         seller: true,
//         productImages: true,
//         reviews: true,
//       },
//     });

//     if (!product) {
//       return notFoundResponse('Product not found');
//     }

//     return successResponse('Product retrieved successfully', product);
//   }

  // Update a product
//   async updateProduct(productId: number, updateData: UpdateProductDataType) {
//     const product = await this.prisma.product.findUnique({
//       where: { id: Number(productId) },
//     });

//     if (!product) {
//       return notFoundResponse('Product not found');
//     }

//     const updatedProduct = await this.prisma.product.update({
//       where: { id: Number(productId) },
//       data: {
//         name: updateData.name || product.name,
//         categoryId: updateData.categoryId || product.categoryId,
//         desc: updateData.desc || product.desc,
//         regularPrice: updateData.regularPrice || product.regularPrice,
//         sellPrice: updateData.sellPrice || product.sellPrice,
//         stock: updateData.stock || product.stock,
//         imageUrl: updateData.imageUrl || product.imageUrl,
//       },
//     });

//     return successResponse('Product updated successfully', updatedProduct);
//   }

  // Delete a product
//   async deleteProduct(productId: number) {
//     const product = await this.prisma.product.findUnique({
//       where: { id: Number(productId) },
//     });

//     if (!product) {
//       return notFoundResponse('Product not found');
//     }

//     await this.prisma.product.delete({
//       where: { id: Number(productId) },
//     });

//     return successResponse('Product deleted successfully');
//   }

  // Add product images
//   async addProductImages(productId: number, imageUrls: string[]) {
//     const product = await this.prisma.product.findUnique({
//       where: { id: Number(productId) },
//     });

//     if (!product) {
//       return notFoundResponse('Product not found');
//     }

//     await this.prisma.productImage.createMany({
//       data: imageUrls.map((imageUrl) => ({
//         productId: Number(productId),
//         imageUrl,
//       })),
//     });

//     return successResponse('Images added successfully');
//   }
}
