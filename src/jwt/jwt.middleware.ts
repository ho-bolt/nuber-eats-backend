import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Injectable } from '@nestjs/common/decorators';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { user, ok } = await this.userService.findById(decoded['id']);
          if (ok) {
            req['user'] = user;
          }
          // 찾은 유저를 request object에 붙여서 보낸다.
          // 그래서 이 미들웨어로 인해 request object를 모든 resolver에서 사용할 수 있다.
          // 이거 이후 app.module의 context에 request 객체가 간다.
        }
      } catch (e) {}
    }
    next();
  }
}
