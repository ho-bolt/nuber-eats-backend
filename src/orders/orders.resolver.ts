import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from 'src/users/entities/users.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PUB_SUB } from 'src/common/common.constants';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation((returns) => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query((returns) => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query((returns) => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Mutation((returns) => Boolean)
  async testSubscription(@Args('id') id: number) {
    await this.pubSub.publish('something_changed', {
      orderSubscription: id,
    });
    return true;
  }

  // 트리거(something_changed)와 publish하는 이름이 같아야 한다.
  @Subscription((returns) => String, {
    filter({ orderSubscription }, { id }) {
      return orderSubscription === id;
    },
  })
  @Role(['Any'])
  orderSubscription(@Args('id') id: number) {
    return this.pubSub.asyncIterator('something_changed');
  }
}

/* PubSub
별도의 서비스에서 작동 중이다. 
만약 동시에 10개의 서버가 있는 경우 다른 별도의 PubSub 인스턴스가 필요하다. 
pubsub은 한 쪽은 publish 다른 한 쪽은 asyncIterator로 주고 받는데 동일한 PubSub 인스턴스가 아니라면 서로 동작하지 않는다. 


PubSub은 진행중인 서버말고 다른 분리된 서버에 저장하라 


filtering을 해야하는 이유 
모든 update를 listen할 필요가 없기 때문 
filter하지 않으면 subscription은 노의미
*/
