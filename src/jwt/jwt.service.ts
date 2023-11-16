import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './interfaces/jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions, // private readonly configService: ConfigService,
  ) {}

  sign(payload: object): string {
    // jwt module 사용 방법
    return jwt.sign(payload, this.options.privateKey);

    // global configService 사용 방법
    //return this.configService.get('PRIVATE_KEY');
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
