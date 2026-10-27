# MovieKeep — 데이터베이스 최종과제

영화 찜과 메모를 주제로 Firebase/Zustand, SQLite SQL, Express를 각각 구현했습니다. 세 실습은 **서로 독립적**입니다. Firebase와 SQLite를 동기화하거나 Express에 DB를 연결하지 않으며, Firebase 화면에서 Express API를 호출하지 않습니다.

## 구현 범위

| 과제 | 구현 파일 | 완료 내용 |
|---|---|---|
| 1 | `firebase-app/src/components/AuthButton.tsx` | TODO 01·02: 인증 사용자와 DB에서 조회한 찜 목록을 Store에 반영 |
| 2 | `FavoriteMemo.tsx`, `AuthButton.tsx` | TODO 03-a/b·04: `updateDoc`으로 메모만 저장, `?? ""`로 누락 메모 복원 |
| 3 | `sql/00-setup.sql` | TODO 12·13: 복합 UNIQUE, 영화 참조 외래 키 |
| 4 | `sql/01-queries.sql` | TODO 05~08: WHERE, AND, DESC, LIMIT 조회 |
| 5 | `sql/02-crud.sql` | TODO 09~11: 메모 기본값을 사용하는 추가, 특정 행 수정·삭제 |
| 6 | `sql/03-constraints.sql` | A~D: 중복·없는 영화·참조 중인 영화 삭제 차단과 테스트 데이터 정리 |
| 7 | `sql/01-queries.sql` | TODO 14~16: JOIN, COUNT, GROUP BY로 빈 메모 현황 조회 |
| 8 | `express-api/server.js` | TODO 17·18: 찜 배열과 배열 길이를 JSON으로 응답 |

TODO 번호는 완성한 위치를 찾을 수 있도록 주석에 남겼습니다. SQL/API의 `user-a`, `user-b`, `user-c`는 과제용 가상 사용자입니다.

## A. Firebase 앱 실행

Node.js 20.9 이상과 npm이 필요합니다. 제공된 `package-lock.json` 버전을 사용합니다.

```sh
cd firebase-app
npm ci
cp .env.example .env.local
```

Windows에서는 `.env.example`을 복사하고 파일 이름을 `.env.local`로 바꿔도 됩니다. 본인 수업 프로젝트의 값을 다음 다섯 항목에 입력합니다.

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
TMDB_TOKEN=
```

```sh
npm run typecheck
npm run dev
```

터미널에 표시된 주소의 `/movies`를 엽니다. 환경 변수를 수정하면 개발 서버를 다시 실행합니다. 기존 Google 로그인, 허용 도메인, 본인 찜 데이터 접근 설정을 사용합니다. `firestore.rules`는 제공된 참고 파일이며 자동 배포되지 않습니다. 권한 오류를 해결하기 위해 Firestore를 공개 접근으로 바꾸지 않습니다.

Firebase/TMDB 설정값은 이 제출물에 들어 있지 않습니다. 실제 로컬 설정으로 Google 로그인, Firestore 메모 저장·수정·빈 메모 저장, 새로고침 복원, 로그아웃과 저장 실패 처리를 확인했고 캡처를 포함했습니다. 타입검사 및 프로덕션 빌드도 통과했습니다. 실제 검증 과정과 범위는 `results/firebase-validation.md`에 정리했습니다.

## B. SQLite 실행

[SQLite Fiddle](https://sqlite.org/fiddle/index.html)의 과제용 환경이나 로컬 SQLite를 사용합니다. `00-setup.sql`은 테이블을 삭제하고 다시 만드므로 실습 전용 DB에서 실행합니다.

1. `sql/00-setup.sql` 전체 실행: 외래 키 활성화 값 1, 영화 6건, 찜 8건 확인.
2. `sql/01-queries.sql`을 한 문장씩 실행: 조건 조회와 빈 메모 집계 확인.
3. `00-setup.sql` 재실행 후 `02-crud.sql`을 위에서 아래로 실행.
4. `00-setup.sql` 재실행 후 `03-constraints.sql`의 A → B → C → D를 한 문장씩 실행.
5. D 직후 찜 9건·영화 106 유지 확인 후 테스트용 id 41을 삭제하여 8건으로 복원.

A·C·D의 제약조건 오류는 기대한 결과입니다. 한 번에 실행하고 첫 오류에서 중단하는 도구라면 다음 문장을 직접 실행해야 합니다. 외래 키 검사는 연결마다 활성화되어야 합니다.

Python 3이 설치되어 있다면 프로젝트 루트에서 제출 SQL 자체를 읽어 검증할 수 있습니다.

```sh
python3 scripts/verify_sql.py
```

실행 SQL, 조회·집계 결과, CRUD 전후 데이터, 제약조건의 실제 오류와 이유는 `results/SQL결과_작성양식.md`를 확인하세요.

## C. Express 실행

별도 터미널에서 실행합니다.

```sh
cd express-api
npm ci
npm run dev
```

| 요청 주소 | 초기 응답 |
|---|---|
| `http://localhost:4000/` | 서버 설명 JSON |
| `http://localhost:4000/api/favorites` | 초기 찜 8건의 JSON 배열 |
| `http://localhost:4000/api/favorite-count` | `{"favoriteCount":8}` |

기본 포트는 4000입니다. 포트를 사용 중인 본인 실습 서버가 있다면 종료한 뒤 실행합니다. 종료는 Ctrl+C입니다. `npm run dev`는 파일 변경 시 서버를 재시작하지만 열린 브라우저 화면은 직접 새로고침해야 합니다.

배열에 `{ id: 30, userId: "user-b", movieId: 106, memo: "" }`를 추가하면 목록 9건과 `{"favoriteCount":9}`가 반환됩니다. 테스트 후 항목을 삭제해야 하며 제출된 `server.js`는 초기 8건 상태입니다. 상세 검증 방법과 실제 HTTP 결과는 `express-api/README.md`, `results/express-validation.md`에 있습니다.

## 핵심 개념 설명

- **새로고침 후 Store를 다시 채우는 이유:** Zustand의 이 Store는 메모리에 있습니다. 페이지를 새로고침하면 초기화되므로 Firebase가 확인한 사용자와 Firestore에서 읽은 찜을 다시 반영해야 화면이 저장된 데이터와 일치합니다.
- **DB 저장 후 Store를 갱신하는 이유:** 화면부터 성공으로 바꾸면 DB 저장 실패 때 화면과 실제 데이터가 달라집니다. `await updateDoc(...)`이 성공한 뒤 Store를 바꾸며, 실패하면 오류 문구만 표시합니다.
- **빈 메모와 찜 삭제의 차이:** 빈 메모 저장은 기존 문서의 `memo`만 `""`로 수정합니다. 문서 ID·사용자 ID·영화 ID와 찜은 유지됩니다. 찜 삭제는 문서 자체를 없애는 별도 동작입니다.
- **복합 UNIQUE와 외래 키의 역할:** `(userId, movieId)` UNIQUE는 같은 사용자가 같은 영화를 중복 찜하지 못하게 합니다. 외래 키는 실제 영화가 있는 찜만 허용하고 참조 중인 영화 삭제를 차단합니다. 다른 사용자는 같은 영화를 찜할 수 있습니다.
- **전체 집계와 사용자별 집계의 차이:** 전체 집계는 빈 메모 전체의 개수 한 값을 반환합니다. 사용자별 집계는 먼저 빈 메모를 골라 `userId`별 개수를 계산합니다. 초기 데이터에서는 전체 2건이고 user-a 1건, user-b 1건이며 user-c는 결과에 없습니다.
- **API 개수를 배열 길이로 계산하는 이유:** 숫자를 직접 쓰면 데이터를 변경할 때 개수 응답이 틀릴 수 있습니다. 요청 시 `favorites.length`를 사용하면 목록과 개수가 같은 배열을 기준으로 계산됩니다.

## 선택 과제

- 빈 메모 화면 필터: 구현하지 않았습니다. 필수 TODO와 제공 UI를 유지했습니다.
- Express 배열 추가·삭제 테스트: 구현 및 실행 기록을 `results/express-validation.md`에 제공합니다. 최종 제출 배열은 초기 8건입니다.

## 실행 결과와 제출 상태

`results/검증요약.md`가 전체 검증 상태와 자료 목록의 기준입니다. 필수 결과 이미지 4장, SQL 실행 기록, 실제 Firebase·Express 검증 기록을 포함했습니다. API 이미지는 실제 요청 주소와 응답을 함께 표시하는 검증 화면 캡처이며 원본 JSON 직접 방문 캡처도 추가로 포함했습니다. 실행하지 않은 결과나 화면을 만들어 넣지 않았습니다.

제출 ZIP에는 소스, lock 파일, 빈 `.env.example`, README와 실제 검증 기록을 포함합니다. `node_modules`, `.next`, `.env.local`, 실제 환경 변수, 임시 서버 파일과 캐시를 제외했습니다.

## 참고 문서

- [Firebase: 기존 문서의 필드 수정](https://firebase.google.com/docs/firestore/manage-data/add-data#update-data)
- [SQLite: 외래 키 활성화와 제약조건](https://www.sqlite.org/foreignkeys.html)
- [Express 5: API 문서](https://expressjs.com/en/5x/api/)
