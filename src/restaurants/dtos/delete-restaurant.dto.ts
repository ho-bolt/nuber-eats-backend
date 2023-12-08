import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantInput } from './create-restaurant.dto';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
