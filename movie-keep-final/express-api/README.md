# Express 독립 실습

TODO 17·18을 완성했습니다. `server.js`의 가상 사용자 찜 배열만 사용하며 Firebase·SQLite와 연결하지 않습니다.

## 실행

Node.js 20.9 이상을 사용합니다. 이 폴더에서 실행합니다.

```sh
npm ci
npm run dev
```

| 주소 | 응답 |
|---|---|
| http://localhost:4000/ | 서버 설명 JSON |
| http://localhost:4000/api/favorites | 초기 찜 8건의 JSON 배열 |
| http://localhost:4000/api/favorite-count | `{"favoriteCount":8}` |

`Ctrl+C`로 종료합니다. `npm start`로도 실행할 수 있습니다. 개수는 매 요청마다 `favorites.length`로 계산하므로 배열 데이터가 바뀌면 목록과 개수가 함께 바뀝니다. 개발 서버가 재시작되어도 브라우저는 직접 새로고침해야 합니다.

## 실행 검증과 선택 과제

실행 중인 **본인 MovieKeep 서버**를 먼저 종료해 4000 포트를 비운 뒤 실행합니다.

```sh
node --check server.js
npm test
```

`verify-api.mjs`가 실제 Express 서버를 시작하고 세 주소를 HTTP로 요청합니다. 초기 8건 → id 30 추가 9건 → id 31 추가 10건 → id 30 제거 9건 → 원본 8건을 확인하므로 선택 과제인 서로 다른 데이터 추가·삭제 테스트도 포함합니다.

추가 데이터 실험은 자동 정리되는 임시 소스 사본에서 실행합니다. 제출용 `server.js`는 바꾸지 않으며 마지막 단계에서 원본 서버의 초기 8건을 다시 검증합니다. 포트가 사용 중이면 다른 서비스를 종료하지 않고 테스트가 실패합니다.

실제 응답과 변경 데이터는 `../results/express-http.json`, 실행 설명은 `../results/express-validation.md`에 있습니다. `npm test`를 다시 실행하면 HTTP 결과 파일을 새 실행 결과로 갱신합니다.

## 요청 주소가 포함된 검증 화면

4000 포트를 비운 뒤 `node capture-evidence.mjs`를 실행하고 `http://localhost:4000/__evidence`를 엽니다. 테스트 항목 추가 상태는 종료 후 `node capture-evidence.mjs --nine`으로 실행합니다. 화면은 두 필수 API에 실제 요청을 보내 URL·상태·응답을 표시합니다. `server.js`는 수정하지 않으며 종료 시 임시 서버 사본을 제거합니다.
