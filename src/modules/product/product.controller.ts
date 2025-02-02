import {
  Controller,
  UseGuards,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import PermissionGuard from 'src/common/guards/permission.guard';
import ValibotValidationPipe from 'src/common/pipes/valibot.validation.pipe';
import { ProductDataType, productSchema } from './product.schema';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nest-lab/fastify-multer';
import { File } from '@nest-lab/fastify-multer';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductController {
  //   constructor(private readonly userService: UserService) {}

  //   @UseGuards(JwtAuthGuard, PermissionGuard('product_add'))
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'featureImages', maxCount: 3 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const fileExt = extname(file.originalname);
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
            cb(null, fileName);
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
        fileFilter: (req, file, cb) => {
          const allowedTypes = ['image/jpeg', 'image/png'];
          if (!allowedTypes.includes(file.mimetype)) {
            return cb(
              new BadRequestException('Only JPG and PNG files are allowed'),
              false,
            );
          }
          cb(null, true);
        },
      },
    ),
  )
  create(
    @UploadedFiles() files: { mainImage?: File[]; featureImages?: File[] },
    @Body(new ValibotValidationPipe(productSchema)) body: ProductDataType,
  ) {
    return {
      ok: true,
      data: {
        ...body,
        mainImage: files.mainImage ? files.mainImage : null,
        featureImages: files.featureImages ? files.featureImages : null,
      },
    };
  }
}
