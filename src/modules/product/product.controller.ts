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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import PermissionGuard from 'src/common/guards/permission.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import { CreateProductType, createProductSchema } from './product.schema';
import { FileFieldsInterceptor } from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';
import { saveFile } from 'src/common/utils/file-upload.util';
import { ProductService } from './product.service';
import { AuthenticatedRequest } from 'src/types/request.interface';
import { FastifyRequest } from 'fastify';
import BaseUrl from 'src/common/utils/base-url.util';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
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
    body.featureImages =
      files.featureImages && files.featureImages.length > 0
        ? files.featureImages
        : null;

    const pipe = new ValibotValidationPipe(createProductSchema);
    const validatedData = pipe.transform(body);

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


  @Get()
  async getProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: FastifyRequest,
  ) {
    const baseUrl = BaseUrl(req, '/products');

    return this.productService.getAllProducts(
      Number(page),
      Number(limit),
      baseUrl,
    );
  }

  @Get(':id')
  getProductById(@Param('id') id: number) {
    return this.productService.getProductById(id);
  }

}
