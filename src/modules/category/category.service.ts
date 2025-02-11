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
import { CategoryType } from './category.schema';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new category
  async createCategory(
    categoryData: {
      image?: string;
    } & CategoryType,
  ) {
    await this.prisma.category.create({
      data: {
        name: categoryData.name,
        parentId: categoryData.parentId || null,
        imageUrl: categoryData.image,
      },
    });
    return createdResponse('Category created successfully');
  }

  // Update an existing category
  async updateCategory(
    categoryId: number,
    categoryData: {
      image?: string;
    } & CategoryType,
  ) {
    await this.prisma.category.update({
      where: { id: Number(categoryId) },
      data: {
        name: categoryData.name,
        parentId: categoryData.parentId || null,
        imageUrl: categoryData.image || null,
      },
    });

    return successResponse('Category updated successfully');
  }

  // Get all categories with pagination
  async getAllCategories(page: number, limit: number, baseUrl: string) {
    const { validPage, validLimit, skip, total } = await calculatePagination(
      this.prisma.category,
      page,
      limit,
    );

    const categories = await this.prisma.category.findMany({
      where: {
        parentId: null,
      },
      take: validLimit,
      skip: skip,
      include: {
        parent: true,
        children: true,
      },
    });

    if (!categories.length) {
      return notFoundResponse('No categories found');
    }

    const pagination = paginateData(validPage, validLimit, total, baseUrl);

    return successResponse('Categories retrieved successfully', {
      categories,
      pagination,
    });
  }

  // Get a single category by ID
  async getCategoryById(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: Number(categoryId) },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      return notFoundResponse('Category not found');
    }

    return successResponse('Category retrieved successfully', category);
  }

  async getCategoryByName(categoryName: string) {
    const category = await this.prisma.category.findUnique({
      where: { name: categoryName }
    });

    if (!category) {
      return notFoundResponse('Category not found');
    }

    return successResponse('Category retrieved successfully', category);
  }

  async findByName(name: string) {
    return await this.prisma.category.findFirst({
      where: { name },
    });
  }

  async findById(id: number) {
    return await this.prisma.category.findUnique({
      where: { id: Number(id) },
    });
  }

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
