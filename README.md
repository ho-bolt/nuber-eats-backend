## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## GIT COMMIT MESSAGE CONVENTION

### 1. 커밋 메세지 구조

type : subject

body

footer

### 2. 커밋 타입

| 기능 이모지 | 기능 이름        | 기능설명                                         |
| ----------- | ---------------- | ------------------------------------------------ |
| ✨          | Feat             | 새로운 기능 추가                                 |
| 🐛          | Fix              | 버그 수정                                        |
| 📱          | Design           | css 등 사용자 UI 디자인 변경                     |
| 💥          | !Breaking change | 커다란 api 변경                                  |
| 🚑️         | !Hotfix          | 급하게 치명적인 버그 고치는 경우                 |
| 📝          | Docs             | 문서 수정                                        |
| 💄          | Style            | 코드 포멧팅, 세미 콜론 누락, 코드 변경 없는 경우 |
| ♻️          | Refactor         | 코드 리펙토링                                    |
| 🧪          | Test             | 테스트 코드, 리펙토링 테스트 코드 추가           |
| 🚧          | Chore            | 빌드 업무 수정 , 패키지 매니저 수정              |
| 💡          | Comment          | 필요한 주석 추가 및 변경                         |
| 🚚          | Rename           | 파일 혹은 폴더명 수정하거나 옮기는 작업          |
| 🔥          | Remove           | 파일 삭제                                        |

-> 이렇게 태그 뒤에는 ":" 붙여서 제목과 구별한다.

추가적인 문맥 정보 위해 괄호안에 적음
ex) Feat (navigation)
Fix (database)

### 3. 주제

- 제목은 50자 넘지 않고 대문자로 작성하고 마침표를 붙이지 않는다.
- 과거 시제 사용말고 명령어로 작성
  - FIXED -> FIX
  - ADDED -> ADD

### 4. 본문(바디)

- 선택사항이라 모든 커밋에 본문내용 작성할 필욘 없음
- 부연설명 필요하거나 커밋의 이유 설명할 경우 작성
- 72자 넘지 않도록 하고 제목과 구분되기 위해 한 칸 띄워 작성

### 5. 푸터 (FOOTER)

- 선택사항이라 모든 커밋에 꼬리말을 작성할 필욘 없음
- issue tracker id 작성할 때 사용
- 유형 # 이슈 번호 형식으로 작성
- 여러 개의 이슈번호는 쉼표로 구분
- 이슈 트래커 유형
  - Fixes : 이슈 수정중 (아직 해결 못함)
  - Resolves : 이슈 해결
  - Ref : 참고할 이슈 있을 때 사용
  - Related to : 해당 커밋에 관련된 이슈번호 (아직 해결 못함)

### 6. 예시 (example)

🐛 fix: fix foo to enable bar

This fixes the broken behavior of the component by doing xyz.

BREAKING CHANGE
Before this fix foo wasn't enabled at all, behavior changes from <old> to <new>

Closes D2IQ-12345

✨ Feat: 회원 가입 기능 구현

SMS, 이메일 중복확인 API 개발

Resolves: #123
Ref: #456
Related to: #48, #45

#Nuber Eats

The backend of Uber Eats Clone

## User Entity :

- id
- createdAt
- updatedAt

- email
- password
- role(client, owner, delivery)

## User CRUD

- Create Account
- Login
- Logout

### 인증처리 순서

token in header-> verify token in middleware -> apollo server context -> authorization guard -> resolver -> made decorator -> change context to graphql context
-> get user from graphql context

### 개발중 발견한 문제점들

1. 프로필 업데이트 시 비밀번호 해쉬화
   - 프로필 업데이트할 때에는 이미 로그인 되어있다 판단하여 db에서 유저를 찾지 않고 쿼리를 실행하여 바로 업데이트 진행
   - 그러다 보니 바로 쿼리로 비밀번호 수정 진행
   - @BeforeUpdate()가 먹히지 않아 비밀번호가 해쉬화 되지 않음
   - @BeofeUpdate()는 특정 entity를 update해야 호출가능

=> 해결 방법
TypeOrm의 save() 함수는 없을 때는 entity를 생성하지만 이미 존재한다면 entity를 update 한다. 따라서 update() 함수를 save() 함수로 바꿔준다.
