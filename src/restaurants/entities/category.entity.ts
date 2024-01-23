import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true }) // 이 inputType이 스키마에 포함되지 않길 원한다는 뜻 그리고 이걸 어딘가에서 복사해서 쓴다는 의미
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  // 여기 type 는 큰 의미 없다 편한대로 작성해도 된다.

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field((type) => [Restaurant], { nullable: true })
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}

// Graphql 에서 @ObjectType
// -> 자동으로 스키마를 빌드하기 위해 사용하는 Graphql 데코레이터

// TypeOrm
// -> @Entity 는 TypeOrm이 db에 이걸 저장하게 해준다.

// 둘다 사용해서 grqphql 스키마와 db에 저장되는 데이터 형식을 만들 수 있다.
