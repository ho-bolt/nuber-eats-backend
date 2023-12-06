import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';

// category respository를 로드할 때마다 this.categories.find 혹은 getOrCreate를 할 수 있다.
@CustomRepository(Category)
export class CategoryRepository extends Repository<Category> {
  public async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
