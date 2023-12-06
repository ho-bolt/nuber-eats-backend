// guard 는 request 다음을 진행할 지 말지 결정한다.
// 현재 가드를 어디서 이용하든 fasle를 리턴해 request를 막는다.

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { User } from 'src/users/entities/users.entity';

@Injectable()
// 이렇게 하는 이유는 context가 http이기 때문에 사용할 수 있는 데이터로 바꿔주기 위함이다.
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    // 여기 이름이 role.decorator.ts에 있는 SetMetadata의 roles와같아야 한다.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    // 로그인 되어 있지 않다는 뜻
    if (!user) {
      return false;
    }
    if (roles.includes('Any')) {
      return true;
    }
    console.log('rrr', user.role);
    return roles.includes(user.role);
  }
}

//authorization은 해당 resolver에 접근 가능한가라고 묻는 게 authorization이다.
// true/false 리턴
// true 리턴하면 request 진행시킴
// false 리턴하면 request 중지시킴
