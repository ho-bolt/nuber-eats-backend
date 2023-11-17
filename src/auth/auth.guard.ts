// guard 는 request 다음을 진행할 지 말지 결정한다.
// 현재 가드를 어디서 이용하든 fasle를 리턴해 request를 막는다.

import { User } from './../users/entities/users.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
// 이렇게 하는 이유는 context가 http이기 때문에 사용할 수 있는 데이터로 바꿔주기 위함이다.
export class AuthGuard implements CanActivate {
  // true/false 리턴
  // true 리턴하면 request 진행시킴
  // false 리턴하면 request 중지시킴
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    if (!user) {
      return false;
    }
    return true;
  }
}


// 