import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

/*
Cooking, Cooked = 음식점 주인이 수정가능 
PickedUp, Delivered = 배달원이 수정 가능 
*/

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}
// enum 등록할 때 사용하는 함수
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  // @RelationId((order: Order) => order.customer)
  // customer_Id: number;

  @Column({ nullable: true })
  customerId: number;

  @Field((type) => User, { nullable: true }) // 주문한 즉시는 배달원이 없기 때문
  @ManyToOne((type) => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  // @RelationId((order: Order) => order.driver)
  // driverId: number;

  @Column({ nullable: true })
  driverId: number;

  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field((type) => [OrderItem])
  @ManyToMany((type) => OrderItem)
  @JoinTable() // 이 컬럼은 소유하고 있는 쪽의 relation에 추가하면 된다.
  // 이 부분이 Dish[]가 아니라 OrderItem[]가 되는 이유는 Dish를 하게 되면 고객이 주문을 할 때 음식 이름, 가격, 사진 설명을 입력해야 주문이 된다.
  // 따라서 OrderItem을 만들어 고객은 선택만 할 수 있게 주문을 만드는 것이다.
  items: OrderItem[];

  @Column({ nullable: true })
  @Field((type) => Float, { nullable: true })
  @IsNumber()
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((type) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

//Field == graphql
