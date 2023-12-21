import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}

// guard를 앱 모든 곳에서 사용하고 싶다면 그냥 APP_GUARD를 provide하면 된다.
// 이걸 하면 모든 곳에서 사용할 수 있게 app.module에 추가해주어야 한다.
// 따라서 현대 APP_GUARD를 하면 계정을 생성할 때도 로그인이 되어있어야 하기 때문에 문제가 된다.
// 그에 대한 이유는 NEST는 모든 resolver를 실행하기 전에 app.module에 주입한 authGuard가 실행되기 때문이다.
