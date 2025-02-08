import {
  Controller,
  Body,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import { createCategorySchema, CreateCategoryType } from './category.schema';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';
import { saveFile } from 'src/common/utils/file.utils';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Create Category
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: File, @Body() body: CreateCategoryType) {
    if (file) {
      body.image = file;
    }
    const pipe = new ValibotValidationPipe(createCategorySchema);
    const validatedData = pipe.transform(body);
    if (file) {
      validatedData.image = await saveFile('./uploads/categories', file);
    }
    return this.categoryService.createCategory(validatedData);
  }

  //   // Update Category
  //   @Patch('update/:id')
  //   @UseGuards(JwtAuthGuard)
  //   @UseInterceptors(FileInterceptor('image'))
  //   async update(
  //     @Param('id') id: number,
  //     @UploadedFile() file: File,
  //     @Body() body: UpdateCategoryType,
  //   ) {
  //     const existingCategory = await this.categoryService.getCategoryById(id);

  //     const pipe = new ValibotValidationPipe(updateCategorySchema);
  //     const validatedData = pipe.transform(body);

  //     if (file) {
  //       if (existingCategory && existingCategory.imageUrl) {
  //         await deleteFile(`.${existingCategory.imageUrl}`);
  //       }
  //       validatedData.imageUrl = await saveFile('./uploads/categories', file);
  //     } else {
  //       validatedData.imageUrl = existingCategory.imageUrl;
  //     }

  //     return this.categoryService.updateCategory(id, validatedData);
  //   }

  //   // Get All Categories
  //   @Get()
  //   async getCategories(
  //     @Query('page') page: number,
  //     @Query('limit') limit: number,
  //     @Req() req: AuthenticatedRequest,
  //   ) {
  //     const baseUrl = BaseUrl(req, '/categories');
  //     return this.categoryService.getAllCategories(
  //       Number(page),
  //       Number(limit),
  //       baseUrl,
  //     );
  //   }

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
