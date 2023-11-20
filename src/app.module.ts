import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/users.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
// javascript 패키지를 import from 으로 사용하는 방법

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] }), // 공유
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== 'prod', // typeOrm이 계속 entity를 동기화 시킴 따라서 개발할 때만 동기화 시키고 아닐때는 동기화 방지
      logging: process.env.NODE_ENV !== 'prod',
      entities: [User, Verification],
    }),
    UsersModule,
    AuthModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
// 여기 미들웨어에 먼저 도착
export class AppModule implements NestModule {
  // 이 configure 함수로 미들웨어 구성
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST,
    });
  }
}

// static module -> 현재 UsersModule이나 JwtModule 처럼 아무런 설정이 없는 정적인 모듈
// dynamic module -> TypeOrmModule처럼 설정이 있는 걸 동적인 모듈

/*
Data Mapper  pattern

Respository 사용 
-> Entity랑 상호작용하는 걸 담당
-> Entity랑 실제로 상호작용하는 Repository만 추가적으로 필요 
Data Mapper는 대규모 앱에서 데이터를 유지관리하는데 도움이 된다. 

Active Record는 소규모 앱에서 단순하게 사용할 수 있도록 도와준다. 
*/

// middleware 를 main.ts 에서 app.use() 를 통해 사용할려면 function 이여야 한다.
// 하지만 지금처럼 JwtMiddleware가 class 라면 app.module에서 사용해야 하낟.

// ApolloServer
/*
context는 함수로 정의되고 request마다 *매번* 호출되며 req property를 가진 object를 받는다. 

*/
