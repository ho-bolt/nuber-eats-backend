import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrderService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

const mockRepository = () => {
  findOne: jest.fn();
  create: jest.fn();
  save: jest.fn();
  find: jest.fn();
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: MockRepository<Order>;
  let orderItemRepository: MockRepository<OrderItem>;
  // 모듈 생성 각각 메소드마다 개별적으로 생성
  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = modules.get<OrderService>(OrderService);
    orderRepository = modules.get(getRepositoryToken(Order));
    orderItemRepository = modules.get(getRepositoryToken(OrderItem));
  });
});
