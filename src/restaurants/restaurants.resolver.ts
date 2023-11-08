import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class RestaurantResolver {
  @Query((returns) => Boolean)
  isPizzGood(): Boolean {
    return true;
  }
}
