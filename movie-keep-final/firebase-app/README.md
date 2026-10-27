# Firebase·Zustand 실습

TODO 01·02·03-a/b·04를 구현했습니다. Firebase가 확인한 사용자를 Store에 반영하고, 사용자의 찜 목록과 메모를 Firestore에서 다시 읽어 복원합니다. 메모는 기존 찜 문서에 `updateDoc()`으로 저장하며 DB 저장이 끝난 뒤 Store를 갱신합니다. 빈 문자열 저장은 찜 삭제와 구분됩니다.

## 실행

Node.js 20.9 이상에서 다음을 실행합니다.

```sh
npm ci
cp .env.example .env.local
```

`.env.local`에 본인 수업 프로젝트의 Firebase 설정 네 값과 `TMDB_TOKEN`을 입력한 뒤 실행합니다.

```sh
npm run dev
```

터미널에 표시된 주소의 `/movies`로 접속합니다. 환경 변수를 바꿨다면 개발 서버를 다시 실행합니다. Google 로그인·허용 도메인·Firestore 규칙은 본인 프로젝트의 기존 설정을 사용합니다. 제공된 `firestore.rules`는 참고 파일이며 자동으로 배포되지 않습니다. `.env.local`은 제출하지 않습니다.

## 확인

```sh
npm run typecheck
```

실제 계정으로 로그인 → 영화 찜 → `주말에 볼 영화` 저장 → `친구와 볼 영화`로 수정 → 새로고침 후 복원 → 빈 메모 저장 후 찜 유지 → 로그아웃 후 초기화를 순서대로 확인합니다. 저장 실패 시에는 성공 문구가 나타나지 않아야 합니다.

실제 Firebase 로그인·Firestore 읽기/쓰기·수정 메모와 빈 메모 복원·로그아웃·저장 실패 처리를 확인하고 캡처했습니다. 타입검사와 프로덕션 빌드도 통과했습니다. 실제 로컬 설정값은 제출하지 않으므로 재실행 시 본인 설정이 필요합니다. 상세 검증 기록은 `../results/firebase-validation.md`에 있습니다.

선택 과제인 빈 메모 화면 필터는 구현하지 않았습니다.

## 참고

- [Firebase 사용자 상태 관찰](https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user)
- [Firestore 기존 문서 업데이트](https://firebase.google.com/docs/firestore/manage-data/add-data#update-data)
