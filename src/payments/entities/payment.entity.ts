import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((type) => String)
  @Column()
  transactionId: string;

  @Field((type) => User, { nullable: true }) // 주문한 즉시는 배달원이 없기 때문
  @ManyToOne((type) => User, (user) => user.payments, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user?: User;

  @Field((type) => Restaurant) // 주문한 즉시는 배달원이 없기 때문
  @ManyToOne((type) => Restaurant)
  restaurant: Restaurant;

  @Field((type) => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;

  @RelationId((payment: Payment) => payment.user)
  userId: number;
}
