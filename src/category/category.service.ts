import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/restaurants/entities/category.entity';
import { CategoryRepository } from 'src/restaurants/respositores/category.respository';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cannot get Categories',
      };
    }
  }

  async countRestaurant(category: Category) {
    return this.restaurants.count({
      where: { category: { id: category.id } },
    });
  }

  async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug },
        relations: ['restaurants'], // 카테고리 관련한 relations 테이블 가져오기 위해 필요
      });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      return {
        ok: true,
        category,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }
}
