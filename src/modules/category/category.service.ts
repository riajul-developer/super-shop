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
import { CreateCategoryType, UpdateCategoryType } from './category.schema';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new category
  async createCategory(
    categoryData: {
      image?: string;
    } & CreateCategoryType,
  ) {
    try {
      const existingCategory = await this.prisma.category.findFirst({
        where: { name: categoryData.name },
      });

      if (existingCategory) {
        badErrorResponse('', [
          {
            field: 'name',
            message: 'Category name must be unique',
          },
        ]);
      }

      if (categoryData.parentId) {
        const parentCategory = await this.prisma.category.findUnique({
          where: { id: categoryData.parentId },
        });
        if (!parentCategory) {
          badErrorResponse('', [
            {
              field: 'parentId',
              message: 'Invalid parent category ID',
            },
          ]);
        }
      }

      await this.prisma.category.create({
        data: {
          name: categoryData.name,
          parentId: categoryData.parentId || null,
          imageUrl: categoryData.image,
        },
      });

      return createdResponse('Category created successfully');
    } catch (error) {
      serverErrorResponse(`${error}`);
    }
  }

  // Update an existing category
  //   async updateCategory(categoryId: number, categoryData: UpdateCategoryType) {
  //     const existingCategory = await this.prisma.category.findUnique({
  //       where: { id: Number(categoryId) },
  //     });

  //     if (!existingCategory) {
  //       return notFoundResponse('Category not found');
  //     }

  //     const updatedCategory = await this.prisma.category.update({
  //       where: { id: Number(categoryId) },
  //       data: {
  //         name: categoryData.name,
  //         parentId: categoryData.parentId || null,
  //         imageUrl: categoryData.image || null,
  //       },
  //     });

  //     return successResponse('Category updated successfully', updatedCategory);
  //   }

  // Get all categories with pagination
  //   async getAllCategories(page: number, limit: number, baseUrl: string) {
  //     const { validPage, validLimit, skip, total } = await calculatePagination(
  //       this.prisma.category,
  //       page,
  //       limit,
  //     );

  //     const categories = await this.prisma.category.findMany({
  //       take: validLimit,
  //       skip: skip,
  //       include: {
  //         parent: true,
  //         children: true,
  //       },
  //     });

  //     if (!categories.length) {
  //       return notFoundResponse('No categories found');
  //     }

  //     const pagination = paginateData(validPage, validLimit, total, baseUrl);

  //     return successResponse('Categories retrieved successfully', {
  //       categories,
  //       pagination,
  //     });
  //   }

  // Get a single category by ID
  //   async getCategoryById(categoryId: number) {
  //     const category = await this.prisma.category.findUnique({
  //       where: { id: Number(categoryId) },
  //       include: {
  //         parent: true,
  //         children: true,
  //       },
  //     });

  //     if (!category) {
  //       return notFoundResponse('Category not found');
  //     }

  //     return successResponse('Category retrieved successfully', category);
  //   }

  // Delete a category
  //   async deleteCategory(categoryId: number) {
  //     const category = await this.prisma.category.findUnique({
  //       where: { id: Number(categoryId) },
  //     });

  //     if (!category) {
  //       return notFoundResponse('Category not found');
  //     }

  //     await this.prisma.category.delete({
  //       where: { id: Number(categoryId) },
  //     });

  //     return successResponse('Category deleted successfully');
  //   }
}
