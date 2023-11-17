import { DynamicModule, Module, Global } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModuleOptions } from './interfaces/jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
        // == {provide : JwtService, useValue : JwtService } 와 같다
      ],
    };
  }
}
