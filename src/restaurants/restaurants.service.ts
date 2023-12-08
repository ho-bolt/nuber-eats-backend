import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/users.entity';
import { CategoryRepository } from './respositores/category.respository';
import { Category } from './entities/category.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SeeRestaurantInput,
  SeeRestaurantOutput,
} from './dtos/see-restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  //const newRestaurant = new Restaurant();
  // create는 instance 생성이고
  // save는 db에 insert하는 거

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput); // create는 instance를 생성하지만 db엔 저장하지 않음
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    // loadRelationsIds는 식당 주인의 아이디를 가지고 온다.
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You cannot edit a restaurant that you don't own ",
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      // save에서 id를 보내지 않으면 새로운 entity를 생성하는 작업을 한다.
      await this.restaurants.save(
        this.restaurants.create({
          id: editRestaurantInput.restaurantId,
          name: editRestaurantInput.name,
          ...editRestaurantInput,
          ...(category && { category }),
        }),
      );
      // 에러 핸들링 다 해주고 이제 본격적으로 처리 == defensive programming
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cannot edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    const restaurant = await this.restaurants.findOne({
      where: { id: restaurantId },
    });
    try {
      if (!restaurant) {
        return {
          ok: false,
          error: 'Cannot find restaurant',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You cannot delete a restaurant that you do not own ',
        };
      }

      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
        error: 'success',
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cannot delete the Restaurant for some reason ',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 5,
        take: 5,
      });
      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 5),
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load Restaurants',
      };
    }
  }

  async seeRestaurantById({
    restaurantId,
  }: SeeRestaurantInput): Promise<SeeRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return { ok: false, error: 'Could not find restaurant' };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Like(`%${query}%`) },
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 5),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurant',
      };
    }
  }
}

// db 건들지 않고 걍 새로운 instance 생성
// dto를 만든게 바로  이런 게 장점
// 그렇지 않다면
/*
      this.restaurants.create({
      name : createRestaurantDto.name  
      })
      이렇게 일일이 적어줘야 하는 거 안해줘도 됨 
      */
