import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from 'src/users/entities/users.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });
        if (!dish) {
          //abort this whole thing
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      const order = this.orders.create({
        customer,
        restaurant,
        total: orderFinalPrice,
        items: orderItems,
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Can not create order',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: true,
            customerId: user.id,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        console.log('aaa', status);
        orders = await this.orders.find({
          where: {
            driver: true,
            driverId: user.id,
            ...(status && { status }), // object에 조건부로 property를 추가할 수 있다.  -> status를 보내지 않으면 모든 order 볼 수 있고 , 보내도 Pending이면 모두 볼 수 있다.
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: true,
            ownerId: user.id,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1); // flat은 모든 하위 array 요소와 함께 새 array를 return 한다.
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get order',
      };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      let canSee = true;
      if (user.role === UserRole.Client && order.customerId !== user.id) {
        canSee = false;
      }
      if (user.role === UserRole.Delivery && order.driverId !== user.id) {
        canSee = false;
      }
      if (
        user.role === UserRole.Owner &&
        order.restaurant.ownerId !== user.id
      ) {
        canSee = false;
      }
      if (!canSee) {
        return {
          ok: false,
          error: 'You can not see this ',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order',
      };
    }
  }
}
