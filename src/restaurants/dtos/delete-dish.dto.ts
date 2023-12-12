import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

// 오너 아이디, 레소토랑 아이디, 디쉬 아이디
@InputType()
export class DeleteDishInput {
  @Field((type) => Int)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreOutput {}
