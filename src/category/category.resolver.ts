import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Category } from 'src/restaurants/entities/category.entity';
import { CategoryService } from './category.service';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @ResolveField((type) => Int)
  restaurantCount(@Parent() category: Category): Promise<Number> {
    return this.categoryService.countRestaurant(category);
  }

  @Query((type) => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.categoryService.allCategories();
  }

  @Query((type) => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.categoryService.findCategoryBySlug(categoryInput);
  }
}

// ResolveField는 매 request 마다 계산된 field를 만들어준다.
// 어디에 저장되는 것이 아니라 조회될 때마다 계산해서 보여주는 dynamicField이다.
