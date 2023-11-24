import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

// fn 은 userRepository 에서 사용한 함수를 mock 함수로 만드는 것

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});
const mockJwtService = {
  sign: jest.fn(() => 'signedToken'),
  verify: jest.fn(),
};
const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// keyof Repository로 해당 레포지토리가 가지고 있는 메서드 추출
// Partial로 감싸 optional처리 진행
// 타입은 어차피 가짜이기 때문에 jest.Mock이다.

describe('UserService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let verificationRepostiory: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;
  // 모듈 만듬
  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(), // 원래 mockRepository가 object였는데 그러면
          //User와 Verification의 안에 있는 함수가 같은 거라 보기 때문에
          //2번 호출되는 경우가 있다. 따라서 mockRepository를 함수로 바꿔준다.
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = modules.get<UsersService>(UsersService);
    mailService = modules.get<MailService>(MailService);
    jwtService = modules.get<JwtService>(JwtService);
    userRepository = modules.get(getRepositoryToken(User));
    verificationRepostiory = modules.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 계정 생성 테스트
  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'asdf@naver.com  ',
      password: '1234',
      role: 0,
    };
    it('should fail if user exists', async () => {
      // 반환값을 속임 (가짜 변수로 )
      // 여기가 user.service에서 createAccount의 findOne 함수의 값을 전달한다.
      // mockResolverValue는 테스트 하고자 하는 함수의 리턴값이 Promise일 경우 사용한다.
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'asdfsadf',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    // 유저가 없어야 users.save()로 오니 undefined 리턴
    it('should create a new User ', async () => {
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepostiory.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepostiory.save.mockResolvedValue({ code: '', email: '' });
      const result = await service.createAccount(createAccountArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepostiory.create).toHaveBeenCalledTimes(1);
      expect(verificationRepostiory.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepostiory.save).toHaveBeenCalledTimes(1);
      expect(verificationRepostiory.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error(':)'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  // 계정 로그인 테스트
  describe('login', () => {
    const loginArgs = {
      email: 'a1111@naver.com',
      password: '1234',
    };

    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong Password' });
    });
    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: expect.any(Number) });
      expect(result).toEqual({ ok: true, token: 'signedToken' });
    });
    it('should fail on exception', async () => {
      userRepository.findOne.mockResolvedValue(new Error('error message'));
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Could not login' });
    });
  });
  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing User', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });
    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User not Found' });
    });
  });
  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: '1234@naver.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'abcd@naver.com' },
      };
      const newVerification = {
        code: 'code',
      };

      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      // 값을 던져주는 파트
      userRepository.findOne.mockResolvedValue(oldUser);
      // create는 promise를 리턴하지 않음
      // save가 promise를 리턴
      verificationRepostiory.create.mockReturnValue(newVerification);
      verificationRepostiory.save.mockResolvedValue(newVerification);

      // 실행파트
      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      // 테스트파트
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: editProfileArgs.userId },
      });

      expect(verificationRepostiory.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepostiory.save).toHaveBeenCalledWith(newVerification);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const changePasswordArgs = {
        userId: 1,
        input: { password: 'newpassword' },
      };

      userRepository.findOne.mockResolvedValue({ password: 'oldpassword' });
      const result = await service.editProfile(
        changePasswordArgs.userId,
        changePasswordArgs.input,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(
        changePasswordArgs.input,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockResolvedValue(new Error());
      const result = await service.editProfile(1, { email: '111@naver.com' });
      expect(result).toEqual({ ok: false, error: 'Can not update profile' });
    });
  });
  it.todo('verifyEmai');
});
