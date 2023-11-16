import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import * as jwt from "jsonwebtoken";
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';

@Injectable()
export class UsersService {

  // ConfigService 는 app.module에 있는 ConfigModule을 가져온다. 
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService :JwtService
  ) {
    
  }



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
      const token = this.jwtService.sign({id:user.id})
      return [true, null, token]
    } catch (error) {
        return [false, "Could not login"]
    }
  
  }

  async findById(id: number):Promise<User> {
    return await this.users.findOne({where:{id}})
  }


  // 여기 온 순간은 이미 토큰이 넘어온(로그인한 상태)라 db로 유저가 있는 지 없는지 확인할 필요없음
  async editProfile(userId: number, { email, password }: EditProfileInput):Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } })
    if (email) {
      user.email=email
    }
    if (password) {
      user.password = password
    }
    return await this.users.save(user);
  }
}
