import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  // ConfigService 는 app.module에 있는 ConfigModule을 가져온다.
  // 유저 모듈의 typeorm.forFeature() 함수에 있어야지 여기서 Respository에 사용할 수 있다.
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // make new user
      // create에서는 entity 생성 (db에 저장은 아님)
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  // 로그인
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      }); // select 옵션을 주면 확실하게 그 컬럼을 넣는다.
      // findOne 옵션은 select에 옵션에 넣은 컬럼만 반환하기 때문에 비밀번호 외에도 id도 넣어주어야 한다.
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: 'Wrong Password' };
      }
      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      return { ok: false, error: 'Could not login' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id } });
      return {
        ok: true,
        user: user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User not Found',
      };
    }
  }

  // 여기 온 순간은 이미 토큰이 넘어온(로그인한 상태)라 db로 유저가 있는 지 없는지 확인할 필요없음
  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (email) {
        user.email = email;
        user.verified = false;
        const varification = await this.verifications.save(
          this.verifications.create({ user }),
        ); // 유저가 email를 변경할 때도 verification을 생성한다.
        this.mailService.sendVerificationEmail(user.email, varification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Can not update profile',
      };
    }
  }

  // userEmail verified true로 바꿈
  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      }); // loadRelationIds 가 true로 해야 relationships에 있는 id가 나온다
      // 안하면 undefined로 나옴
      // relations로 하면 해당 연관 엔티티 자체가 온다. relations:["user"]
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not Found' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
