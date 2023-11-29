import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: '1234@naver.com',
  password: '1234',
};

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let usersRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // 전체 모듈을 load해서 Resolver를 테스트 할 것
    }).compile();

    app = module.createNestApplication();
    // userProfile할 때 로그인한 유저의 token값을 가져오기 위한 것
    // userRepository를 가져올 수 있어 userProfile하기 전에 일단 database에 접근할 수 있음
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    // test가 끝난 후엔 database를 drop해야한다.
    const dataSource: DataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    const connection: DataSource = await dataSource.initialize();
    await connection.dropDatabase(); // db 삭제
    await connection.destroy(); // 연결해제
    await app.close();
  });

  describe('createAccount', () => {
    let query = `mutation{
            createAccount(input:{
            email:"${testUser.email}",
            password:"${testUser.password}",
            role:Owner
        })
            {
              ok
              error
            }
        }`;
    it('should create account', async () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(200);
          expect(createAccount.ok).toBe(true);
          expect(createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toBe(
            'There is a user with that email already',
          );
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials(token)', () => {
      let query = `mutation{
      login(input:{
        email:"${testUser.email}",
        password:"${testUser.password}"
      })
      {
        ok
        error
        token
      }
    }`;
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credintials(token)', () => {
      let query = `mutation{
            login(input:{
              email:"1asdfa@naver.com",
              password:"${testUser.password}"
            })
            {
              ok
              error
              token
            }
          }`;
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('User not found');
          expect(login.error).toEqual(expect.any(String));
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should find a user's profile ", () => {
      let query = `{
          userProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }`;
      return privateTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      let query = `{
          userProfile(userId:${userId + 1}){
            ok
            error
            user{
              id
            }
          }
        }`;
      return privateTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not Found');
          expect(user).toBe(null);
        });
    });
  });
  describe('me', () => {
    let query = `{
          me{
            email
          }
        }`;
    it('should find my profile', () => {
      return privateTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });
    it('should not allow logged out user', () => {
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('editProfile', () => {
    const NEW_EMAIL = 'abcd@naver.com';
    it('should change email', () => {
      let query = `mutation{
                editProfile(input:{
                  email:"${NEW_EMAIL}"
                })
                  {
                    ok
                    error
                  }
                }
                `;
      return privateTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      let query = `{
          me{
            email
          }
        }`;
      return privateTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      let query = `mutation{
                  verifyEmail(input:{code:"${verificationCode}"})
                  {
                    ok
                    error
                  }
                }`;
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on wrong verification code', () => {
      let query = `mutation{
                verifyEmail(input:{code:"afsdf"})
                {
                  ok
                  error
                }
                
              }`;
      return publicTest(query)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not Found');
        });
    });
  });
});

// 이 에러는 앱을 종료시키지 않아서 발생하는 것으로 afterAll를 해줘야 한다.
/*
 Jest did not exit one second after the test run has completed 
 this usually means that there are asynchronous operations that weren't stopped in your tests. 
 consider runnint Jest with `--detectOpenHandles` to troubleshoot this issue.
 */
