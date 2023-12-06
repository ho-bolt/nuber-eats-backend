import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './respositores/category.respository';
import { TypeOrmExModule } from 'src/database/typrorm-ex.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    TypeOrmExModule.forCustomRepository([CategoryRepository]),
  ],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}

// 모듈에서 레포지토리가 필요하다.
// resolvers에서 사용할 수 있게 모듈의 providers에 RestaurantService를 추가해줘야 한다.
