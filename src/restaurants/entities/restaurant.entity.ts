import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/users/entities/users.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

@InputType('RestaurantInputType', { isAbstract: true }) // 이 inputType이 스키마에 포함되지 않길 원한다는 뜻 그리고 이걸 어딘가에서 복사해서 쓴다는 의미
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  // 여기 type 는 큰 의미 없다 편한대로 작성해도 된다.

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  category: Category;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @Field((type) => [Order], { nullable: true })
  @OneToMany((type) => Order, (order) => order.restaurant)
  orders: Order[];

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field((type) => [Dish])
  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  menu: Dish[];

  @Field((type) => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field((type) => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;
}

// Graphql 에서 @ObjectType
// -> 자동으로 스키마를 빌드하기 위해 사용하는 Graphql 데코레이터

// TypeOrm
// -> @Entity 는 TypeOrm이 db에 이걸 저장하게 해준다.

// 둘다 사용해서 grqphql 스키마와 db에 저장되는 데이터 형식을 만들 수 있다.

// restaurant 필드에서 {nullable:true}를 주는 이유는 카테고리가 지워졌을 때 레스토랑까지 같이 지워지면 안되기 때문이다.
// 카테고리가 지워져도 레스토랑은 그대로 있고 레스토랑은 카테고리만 잃을 분이다.
