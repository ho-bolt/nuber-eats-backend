import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  // 여기 type 는 큰 의미 없다 편한대로 작성해도 된다.

  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => String)
  @Column()
  name: string;

  @Field((type) => Boolean)
  @Column()
  isVegan?: boolean;

  @Field((type) => String)
  @Column()
  address: string;

  @Field((type) => String)
  @Column()
  ownerName: string;

  @Field((type) => String)
  @Column()
  categoryName: string;
}

// Graphql 에서 @ObjectType
// -> 자동으로 스키마를 빌드하기 위해 사용하는 Graphql 데코레이터

// TypeOrm
// -> @Entity 는 TypeOrm이 db에 이걸 저장하게 해준다.

// 둘다 사용해서 grqphql 스키마와 db에 저장되는 데이터 형식을 만들 수 있다.
