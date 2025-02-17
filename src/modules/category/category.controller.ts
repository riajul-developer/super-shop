import {
  Controller,
  Body,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  Query,
  Req,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import { categorySchema, CategoryType } from './category.schema';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';
import { deleteFile, saveFile } from 'src/common/utils/file.utils';
import { badErrorResponse } from 'src/common/utils/response.util';
import { FastifyRequest } from 'fastify';
import BaseUrl from 'src/common/utils/base-url.util';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Create Category
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: File, @Body() body: CategoryType) {
    if (typeof file === 'object' && file !== null) {
      body.image = file;
    }
    const pipe = new ValibotValidationPipe(categorySchema);
    const validatedData = pipe.transform(body);

    const existingCategoryName = await this.categoryService.findByName(
      validatedData.name,
    );

    if (existingCategoryName) {
      badErrorResponse('', [
        {
          field: 'name',
          message: 'Category name must be unique',
        },
      ]);
    }

    if (validatedData.parentId) {
      const existingCategory = await this.categoryService.findById(
        validatedData.parentId,
      );
      if (!existingCategory) {
        badErrorResponse('', [
          {
            field: 'parentId',
            message: 'Invalid parent category ID',
          },
        ]);
      }
    }

    if (typeof file === 'object' && file !== null) {
      validatedData.image = await saveFile('./uploads/categories', file);
    }
    return this.categoryService.createCategory(validatedData);
  }

  // Update Category
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @UploadedFile() file: File,
    @Body() body: CategoryType,
  ) {
    if (typeof file === 'object' && file !== null) {
      body.image = file;
    }
    const pipe = new ValibotValidationPipe(categorySchema);
    const validatedData = pipe.transform(body);

    const existingCategory = await this.categoryService.findById(id);

    if (!existingCategory) {
      badErrorResponse('Category not found');
    }

    const existingCategoryName = await this.categoryService.findByName(
      validatedData.name,
    );

    if (existingCategoryName && existingCategoryName.id !== Number(id)) {
      badErrorResponse('', [
        {
          field: 'name',
          message: 'Category name must be unique',
        },
      ]);
    }

    if (validatedData.parentId) {
      const existingParentCategory = await this.categoryService.findById(
        validatedData.parentId,
      );

      if (!existingParentCategory || existingParentCategory.id === Number(id)) {
        badErrorResponse('', [
          {
            field: 'parentId',
            message: 'Invalid parent category ID',
          },
        ]);
      }
    }

    if (typeof file === 'object' && file !== null) {
      if (existingCategory && existingCategory.imageUrl) {
        await deleteFile(`.${existingCategory.imageUrl}`);
      }
      validatedData.image = await saveFile('./uploads/categories', file);
    } else if (existingCategory && existingCategory.imageUrl) {
      validatedData.image = existingCategory.imageUrl;
    }

    return this.categoryService.updateCategory(id, validatedData);
  }

  // Get All Categories
  @Get()
  async getCategories(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: FastifyRequest,
  ) {
    const baseUrl = BaseUrl(req, '/categories');
    return this.categoryService.getAllCategories(page, limit, baseUrl);
  }

  //   // Get Category by ID
  //   @Get(':id')
  //   getCategoryById(@Param('id') id: number) {
  //     return this.categoryService.getCategoryById(id);
  //   }

  //   // Delete Category
  //   @Delete('delete/:id')
  //   @UseGuards(JwtAuthGuard)
  //   async deleteCategory(@Param('id') id: number) {
  //     const category = await this.categoryService.getCategoryById(id);
  //     if (category && category.imageUrl) {
  //       await deleteFile(`.${category.imageUrl}`);
  //     }
  //     return this.categoryService.deleteCategory(id);
  //   }
}
