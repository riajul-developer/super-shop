import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import {
  createdResponse,
  notFoundResponse,
  successResponse,
} from 'src/common/utils/response.util';
import {
  calculatePagination,
  paginateData,
} from 'src/common/utils/pagination.util';
import { CreateProductType } from './product.schema';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new product
  async createProduct(
    productData: {
      sellerId: number;
      mainImage: string;
      featureImages: string[];
    } & CreateProductType,
  ) {
    await this.prisma.$transaction(async (prisma) => {
      const createdProduct = await prisma.product.create({
        data: {
          sellerId: productData.sellerId,
          categoryId: productData.categoryId || null,
          name: productData.name,
          desc: productData.desc || null,
          regularPrice: productData.regularPrice || null,
          sellPrice: productData.sellPrice,
          stock: productData.stock,
          imageUrl: productData.mainImage,
        },
      });

      if (productData.featureImages && productData.featureImages.length > 0) {
        await prisma.productImage.createMany({
          data: productData.featureImages.map((imageUrl) => ({
            productId: createdProduct.id,
            imageUrl,
          })),
          skipDuplicates: true,
        });
      }
    });

    return createdResponse('Product created successfully', null);
  }

  // Get all products with pagination
  async getAllProducts(page: number, limit: number, baseUrl: string) {
    const { validPage, validLimit, skip, total } = await calculatePagination(
      this.prisma.product,
      page,
      limit,
    );

    const products = await this.prisma.product.findMany({
      take: validLimit,
      skip: skip,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!products.length) {
      return notFoundResponse('No products found');
    }

    const pagination = paginateData(validPage, validLimit, total, baseUrl);

    return successResponse('Products retrieved successfully', {
      products,
      pagination,
    });
  }

  // Get a product by ID
  async getProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        productImages: true,
        reviews: true,
      },
    });

    if (!product) {
      return notFoundResponse('Product not found');
    }

    return successResponse('Product retrieved successfully', product);
  }

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
}
