# Express API 실행 결과

검증일: 2026-10-27 (한국 시간). Node.js v24.21.0 / npm 11.19.0에서 실행했습니다.

## 구현

- TODO 17: `GET /api/favorites`에서 `res.json(favorites)`로 배열을 응답합니다.
- TODO 18: `GET /api/favorite-count`에서 `res.json({ favoriteCount: favorites.length })`로 현재 길이를 응답합니다.
- `/`의 제공된 서버 설명 응답, 초기 찜 배열 8건, 4000 포트를 유지했습니다.
- DB나 Firebase 연결, 추가·삭제 HTTP API는 구현 범위에 포함하지 않습니다.

## 실제 실행

```text
$ npm ci --no-audit --no-fund
added 65 packages

$ node --check server.js
(출력 없음, 종료 코드 0)

$ npm test
PASS initial: list=8, count=8
PASS add-id-30: list=9, count=9
PASS add-id-31: list=10, count=10
PASS remove-id-30: list=9, count=9
PASS restore-initial: list=8, count=8
PASS original source unchanged; final array restored to the initial 8 records.
HTTP evidence: ../results/express-http.json
```

설치 시 프로젝트의 기존 `package-lock.json`과 의존 버전을 유지했습니다. 최초 제한된 실행 환경에서는 npm 주소 조회 오류(ENOTFOUND)와 포트 열기 제한(EPERM)이 있었고, 허용된 네트워크·로컬 서버 실행 환경에서 다시 실행하여 위 검증이 통과했습니다.

## 요청과 응답

각 단계는 이전 서버를 종료한 뒤 새로운 실제 Express 프로세스로 실행했습니다. 각 단계마다 아래 세 URL을 다시 요청했으며, 모두 HTTP 200과 JSON 콘텐츠 형식을 확인했습니다.

- `http://localhost:4000/`: `{"message":"MovieKeep 찜 API 서버입니다."}`
- `http://localhost:4000/api/favorites`: 해당 단계의 실제 배열
- `http://localhost:4000/api/favorite-count`: 해당 단계의 배열 길이

| 단계 | 초기 배열에 대한 변경 | 목록 길이 | 개수 응답 | 확인 |
|---|---|---:|---|---|
| initial | 없음 | 8 | `{"favoriteCount":8}` | 통과 |
| add-id-30 | id 30 추가 | 9 | `{"favoriteCount":9}` | 통과 |
| add-id-31 | id 30, id 31 추가 | 10 | `{"favoriteCount":10}` | 통과 |
| remove-id-30 | id 30 제거, id 31만 추가된 상태 | 9 | `{"favoriteCount":9}` | 통과 |
| restore-initial | 테스트 항목을 모두 제거한 원본 실행 | 8 | `{"favoriteCount":8}` | 통과 |

테스트 항목의 실제 값:

```json
[
  { "id": 30, "userId": "user-b", "movieId": 106, "memo": "" },
  { "id": 31, "userId": "user-c", "movieId": 105, "memo": "추가 검증 영화" }
]
```

모든 단계에서 목록의 초기 id 1~8과 각 메모가 그대로 유지되는지 확인했습니다. 추가 항목의 내용, 순서, 목록 길이와 개수 응답의 일치 여부도 확인했습니다. 서로 다른 테스트 항목을 추가·삭제하는 **선택 과제 2를 수행**했습니다.

변경 단계는 `server.js`의 임시 사본에서 배열 항목만 바꾸어 실행했습니다. 마지막 단계는 제출할 원본 `server.js`를 실행했고, 원본 파일 내용이 테스트 전후 동일한지 검사했습니다. 최종 제출 배열은 초기 8건입니다. 테스트가 만든 임시 서버 파일과 프로세스는 정리했습니다.

## 결과 자료와 재현

`express-http.json`에는 각 요청 URL, HTTP 상태, 응답 헤더, 원문 응답 본문(`body`), 파싱한 JSON, 테스트 데이터, 서버 시작 출력이 저장되어 있습니다. 원본 서버 파일의 SHA-256도 포함하여 제출 소스와 대응시킬 수 있습니다. 이 자료는 실제 HTTP 실행 기록이며 브라우저 스크린샷을 대체했다고 주장하지 않습니다.

```sh
cd express-api
npm ci
npm test
```

4000 포트를 사용 중인 본인 MovieKeep 서버는 먼저 종료합니다. 테스트는 다른 프로세스를 강제로 종료하지 않습니다.

## 추가 캡처 검증

`capture-evidence.mjs`의 문법 검사 및 실제 서버 실행을 확인했습니다. 초기 8건 서버와 id 30 추가 후 9건 서버에서 브라우저가 두 필수 API에 실제 GET 요청을 보내 HTTP 200과 올바른 배열·개수를 표시하는 것을 확인했습니다. 요청 주소와 응답이 함께 표시된 실제 검증 화면을 필수 PNG로 저장했으며, 원본 URL 직접 방문 캡처도 `result-api-list-raw.png`, `result-api-count-raw.png`로 함께 제공합니다. 캡처용 서버는 모두 종료했고 제출 server.js는 초기 8건 그대로입니다.
