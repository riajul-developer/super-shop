import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoryModule } from '../category/category.module';

@Module({
  providers: [ProductService],
  controllers: [ProductController],
  imports: [CategoryModule],
})
export class ProductModule {}
