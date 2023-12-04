import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/users.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

// 이 데코레이터는 메타데이터를 설정한다.
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
