import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<[boolean, string?]> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return [false, 'There is a user with that email already'];
      }
      // make new user
      // create에서는 entity 생성 (db에 저장은 아님)
      await this.users.save(this.users.create({ email, password, role }));
      return [true];
    } catch (e) {
      return [false, "Couldn't create account"];
    }
  }

  // 로그인 
  async login({ email, password }: LoginInput): Promise<[boolean, string?, token?: string]> {
    
    try {
      const user = await this.users.findOne({ where: { email } })
      if (!user) {
        return [false, "User not found"]
      }
      const passwordCorrect = await user.checkPassword(password)
      if (!passwordCorrect) {
          return [false, "Wrong Password"]
      }
      return [true, null,"token"]
    } catch (error) {
        return [false, "Could not login"]
    }
  
  }
}
