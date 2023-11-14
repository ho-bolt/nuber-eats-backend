import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsString, IsBoolean, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}

// InputType 은 하나의 object

// ArgsType
// 분리된 argument로써 정의할 수 있게 해줌

// entity 하나의 파일만 만들고 dto를 계속 수정하는 건 번거로운 작업이다.
// 따라서 mapped type을 사용해 entity 타입 하나만 만들고 코드를 이용해 계속 entity와 동일시 시킨다.

// omitType에서 두 번째 인자로 inputType을 넣을 수 있는 데 그건 entity에서 inputType에 isAbstract: true 옵션을 주지 않았을 때 그렇게 한다.
