import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SeeRestaurantInput {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class SeeRestaurantOutput extends CoreOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
