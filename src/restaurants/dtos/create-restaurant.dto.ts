import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
]) {
  @Field((type) => String)
  categoryName: string;
}
// 레스토랑 만들 때 카테고리에 있는 건 만들면 안됨
// 사람들이 restaurant owner를 설정할 수 없게 만들기 위해 owner도 빼줌

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field((type) => Int)
  restaurantId?: number;
}

// InputType 은 하나의 object

// ArgsType
// 분리된 argument로써 정의할 수 있게 해줌

// entity 하나의 파일만 만들고 dto를 계속 수정하는 건 번거로운 작업이다.
// 따라서 mapped type을 사용해 entity 타입 하나만 만들고 코드를 이용해 계속 entity와 동일시 시킨다.

// omitType에서 두 번째 인자로 inputType을 넣을 수 있는 데 그건 entity에서 inputType에 isAbstract: true 옵션을 주지 않았을 때 그렇게 한다.
