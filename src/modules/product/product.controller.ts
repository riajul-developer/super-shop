import {
  Controller,
  Body,
  Post,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import PermissionGuard from 'src/common/guards/permission.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import {
  CreateProductType,
  UpdateProductType,
  createProductSchema,
  updateProductSchema,
} from './product.schema';
import { FileFieldsInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';
import { deleteFile, saveFile } from 'src/common/utils/file.utils';
import { ProductService } from './product.service';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { FastifyRequest } from 'fastify';
import BaseUrl from 'src/common/utils/base-url.util';
import { badErrorResponse } from 'src/common/utils/response.util';
import { CategoryService } from '../category/category.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  // create produce
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'featureImages', maxCount: 5 },
    ]),
  )
  async create(
    @UploadedFiles() files: { mainImage?: File[]; featureImages?: File[] },
    @Body() body: CreateProductType,
    @Req() req: AuthenticatedRequest,
  ) {
    body.mainImage = (files.mainImage && files.mainImage[0]) ?? null;
    if (files.featureImages && files.featureImages.length > 0) {
      body.featureImages = files.featureImages;
    }

    const pipe = new ValibotValidationPipe(createProductSchema);
    const validatedData = pipe.transform(body);

    if (validatedData.categoryId) {
      const existingCategory = await this.categoryService.findById(
        validatedData.categoryId,
      );

      if (!existingCategory) {
        badErrorResponse('', [
          {
            field: 'categoryId',
            message: 'Category not found',
          },
        ]);
      }
    }

    if (files.mainImage && files.mainImage[0]) {
      validatedData.mainImage = await saveFile(
        './uploads/products',
        files.mainImage[0],
      );
    }

    if (files.featureImages && files.featureImages.length > 0) {
      validatedData.featureImages = await Promise.all(
        files.featureImages.map((file) => saveFile('./uploads/products', file)),
      );
    }
    const sellerId = req.user?.id;
    return this.productService.createProduct({ ...validatedData, sellerId });
  }

  // update product
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'featureImages', maxCount: 5 },
    ]),
  )
  async update(
    @Param('id') id: number,
    @UploadedFiles() files: { mainImage?: File[]; featureImages?: File[] },
    @Body() body: UpdateProductType,
  ) {
    const existingProduct = await this.productService.getProductById(id);

    if (files.mainImage && files.mainImage[0]) {
      body.mainImage = files.mainImage[0];
    }
    if (files.featureImages && files.featureImages.length > 0) {
      body.featureImages = files.featureImages;
    }
    const pipe = new ValibotValidationPipe(updateProductSchema);
    const validatedData = pipe.transform(body);

    if (validatedData.categoryId) {
      const existingCategory = await this.categoryService.findById(
        validatedData.categoryId,
      );

      if (!existingCategory) {
        badErrorResponse('', [
          {
            field: 'categoryId',
            message: 'Category not found',
          },
        ]);
      }
    }

    if (files.mainImage && files.mainImage[0]) {
      if (existingProduct) {
        await deleteFile(`.${existingProduct.data.imageUrl}`);
      }
      validatedData.mainImage = await saveFile(
        './uploads/products',
        files.mainImage[0],
      );
    } else {
      if (existingProduct) {
        validatedData.mainImage = existingProduct.data.imageUrl;
      }
    }

    if (files.featureImages && files.featureImages.length > 0) {
      if (existingProduct && existingProduct.data.productImages.length > 0) {
        await Promise.all(
          existingProduct.data.productImages.map((imageData) =>
            deleteFile(`.${imageData.imageUrl}`),
          ),
        );
      }

      validatedData.featureImages = await Promise.all(
        files.featureImages.map((file) => saveFile('./uploads/products', file)),
      );
    }
    return this.productService.updateProduct(id, validatedData);
  }

  @Get()
  async getProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: FastifyRequest,
  ) {
    const baseUrl = BaseUrl(req, '/products');

    return this.productService.getAllProducts(page, limit, baseUrl);
  }

  @Get(':id')
  getProductById(@Param('id') id: number) {
    return this.productService.getProductById(id);
  }
}
