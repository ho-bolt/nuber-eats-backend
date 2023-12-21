// guard 는 request 다음을 진행할 지 말지 결정한다.
// 현재 가드를 어디서 이용하든 fasle를 리턴해 request를 막는다.

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
// 이렇게 하는 이유는 context가 http이기 때문에 사용할 수 있는 데이터로 바꿔주기 위함이다.
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // 여기 이름이 role.decorator.ts에 있는 SetMetadata의 roles와같아야 한다.
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();

    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.userService.findById(decoded['id']);
        if (!user) {
          return false;
        }
        gqlContext['user'] = user;
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }

    // 찾은 유저를 request object에 붙여서 보낸다.
    // 그래서 이 미들웨어로 인해 request object를 모든 resolver에서 사용할 수 있다.
    // 이거 이후 app.module의 context에 request 객체가 간다.
  }

  // 로그인 되어 있지 않다는 뜻
}

//authorization은 해당 resolver에 접근 가능한가라고 묻는 게 authorization이다.
// true/false 리턴
// true 리턴하면 request 진행시킴
// false 리턴하면 request 중지시킴

/*
guard가 데코레이터보다 먼저 호출됨  

guard가 user를 graphqlcontext에 추가하고 

데코레이터가 호출되면 graphql context 내부에서 user를 찾는다. 


*/
