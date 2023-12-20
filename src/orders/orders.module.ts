import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { User } from 'src/users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish, User]),
  ],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
