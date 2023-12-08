import { RestaurantService } from './restaurants.service';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/users.entity';
import { Role } from 'src/auth/role.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
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

@Resolver((of) => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  //AuthUser를 넣어줌으로써 restaurant의 owner는 로그인한 유저가 된다.
  @Mutation((returns) => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    console.log('레스토랑 생성');
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Mutation((returns) => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation((returns) => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantOutput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantOutput,
    );
  }

  @Query((returns) => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantInput);
  }

  @Query((returns) => SeeRestaurantOutput)
  seeRestaurant(
    @Args('input') restaurantInput: SeeRestaurantInput,
  ): Promise<SeeRestaurantOutput> {
    return this.restaurantService.seeRestaurantById(restaurantInput);
  }

  @Query((returns) => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}
