import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/users.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

// 이 데코레이터는 metadata 설정한다.
// metadata는 resolver의 extra data이다.
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
