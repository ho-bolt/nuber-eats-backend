import { Res } from '@nestjs/common';
import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}
// enum 등록할 때 사용하는 함수
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field((type) => User, { nullable: true }) // 주문한 즉시는 배달원이 없기 때문
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field((type) => [Dish])
  @ManyToMany((type) => Dish)
  @JoinTable() // 이 컬럼은 소유하고 있는 쪽의 relation에 추가하면 된다.
  dishes: Dish[];

  @Column({ nullable: true })
  @Field((type) => Float, { nullable: true })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus })
  @Field((type) => OrderStatus)
  status: OrderStatus;
}

//Field == graphql
