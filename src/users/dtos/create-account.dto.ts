import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/users.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
