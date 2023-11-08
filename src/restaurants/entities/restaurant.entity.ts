import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  // 여기 type 는 큰 의미 없다 편한대로 작성해도 된다.
  @Field((type) => String)
  name: string;
  @Field((type) => Boolean)
  isVegan?: boolean;

  @Field((type) => String)
  address: string;

  @Field((type) => String)
  ownerName: string;
}
