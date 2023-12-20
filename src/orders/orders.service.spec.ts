import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrderService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { User } from 'src/users/entities/users.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: MockRepository<Order>;
  let restaurantRepository: MockRepository<Restaurant>;
  let orderItemRepository: MockRepository<OrderItem>;
  let dishRepository: MockRepository<Dish>;

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
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = modules.get<OrderService>(OrderService);
    orderRepository = modules.get(getRepositoryToken(Order));
    restaurantRepository = modules.get(getRepositoryToken(Restaurant));
    orderItemRepository = modules.get(getRepositoryToken(OrderItem));
    dishRepository = modules.get(getRepositoryToken(Dish));
  });
  it('should be defined OrderService', () => {
    expect(service).toBeDefined();
  });

  // 주문 생성 테스트
  describe('createOrder', () => {
    enum UserRole {
      Owner = 'Owner',
      Client = 'Client',
      Delivery = 'Delivery',
    }
    const userArgs: User = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: '1234',
      email: '1234@naver.com',
      role: UserRole.Client,
      verified: false,
      restaurants: [],
      orders: [],
      rides: [],
      async hashPassword() {},
      async checkPassword(): Promise<boolean> {
        return true;
      },
    };

    it('should fail if Restaurant is not exists', async () => {
      const restaurantCheckArgs = {
        restaurantId: 111,
        items: [],
      };
      restaurantRepository.findOne.mockResolvedValue(null);
      const result = await service.createOrder(userArgs, restaurantCheckArgs);
      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(result).toMatchObject({
        ok: false,
        error: 'Restaurant not found',
      });
    });
    it('should fail it Dish is not exists', async () => {
      const dishCheckArgs = {
        restaurantId: 111,
        items: [{ dishId: null }],
      };
      restaurantRepository.findOne.mockResolvedValueOnce(dishCheckArgs);
      dishRepository.findOne.mockResolvedValue(dishCheckArgs.items[0].dishId);
      const result = await service.createOrder(userArgs, dishCheckArgs);
      expect(restaurantRepository.findOne).toHaveBeenCalledTimes(1);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(dishRepository.findOne).toHaveBeenCalledTimes(
        dishCheckArgs.items.length,
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toMatchObject({
        ok: false,
        error: 'Dish not found',
      });
    });
    it('should cost $13 for order', async () => {
      const orderArgs = {
        restaurantId: 1,
        items: [
          { dishId: 1, options: [{ name: 'spice level', choice: 'hot' }] },
        ],
      };
      const dishArgs = {
        id: 1,
        price: 12,
        options: [
          { name: 'spice level', choices: [{ name: 'hot', extra: 1 }] },
        ],
      };

      restaurantRepository.findOne.mockResolvedValueOnce(orderArgs);
      dishRepository.findOne.mockResolvedValueOnce(orderArgs.items[0].dishId);

      const result = service.createOrder(userArgs, orderArgs);
    });
  });
});
