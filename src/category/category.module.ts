import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from 'src/database/typrorm-ex.module';
import { Category } from 'src/restaurants/entities/category.entity';
import { CategoryRepository } from 'src/restaurants/respositores/category.respository';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryRepository, Restaurant]),
  ],
  providers: [CategoryResolver, CategoryService],
})
export class CategoryModule {}
