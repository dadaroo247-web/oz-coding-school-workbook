# Firebase·Zustand 실제 검증 기록

검증일: 2026-10-27 (한국 시간)

## 구현 및 환경

- TODO 01: Firebase 인증 상태를 `setUser(currentUser)`로 반영하고 구독 해제를 유지했습니다.
- TODO 02: `setFavorites(() => favoriteList)`로 조회 결과를 반영합니다.
- TODO 03-a/b: `await updateDoc(favoriteRef, { memo })` 성공 후에만 Store와 성공 문구를 갱신합니다.
- TODO 04: `data.memo ?? ""`로 누락된 메모의 기본값을 처리합니다.
- Node.js v24.21.0 / npm 11.19.0 / TypeScript 5.9.3.
- 제공된 Firebase 12.19.0, Next.js 16.3.7, React 19.2.0, Zustand 5.0.15 및 lock 파일을 유지했습니다.

최초 검증에서는 실제 설정이 없어 타입검사만 수행했습니다. 이후 사용자에게 받은 TMDB 토큰과 이전 수업용 영화 앱의 로컬 Firebase 설정을 적용하여 아래 실제 검증을 완료했습니다. Firebase Console은 MFA 설정 안내가 있었으므로 콘솔 설정을 변경하지 않았습니다. 앱은 기존 Firebase Authentication/Firestore 설정으로 정상 동작했습니다. 인증·보안 규칙을 우회하거나 공개 접근으로 바꾸지 않았습니다.

## 실제 실행 결과

테스트 주소: `http://localhost:3100/movies` (기존 서버와의 포트 충돌 방지를 위한 검증 포트).

| 순서 | 동작 | 실제 확인 결과 |
|---|---|---|
| 1 | TMDB 영화 목록 조회 | 인기 영화 목록 표시 성공 |
| 2 | Google 로그인 및 기존 찜 조회 | 사용자 표시와 기존 찜 상태 복원 성공 |
| 3 | 찜이 없던 `프로젝트 헤일메리`(movieId 687163) 찜하기 | 찜 해제 버튼과 메모 입력란 표시 |
| 4 | `주말에 볼 영화` 저장 | 메모를 저장했습니다. 표시 |
| 5 | `친구와 볼 영화`로 수정·저장 | 수정값과 저장 성공 표시 |
| 6 | 브라우저 새로고침 | 인증·DB 조회 후 같은 영화의 찜과 `친구와 볼 영화` 복원 |
| 7 | 메모 전체 삭제 후 저장 | 빈 입력란·메모를 저장했습니다.·찜 해제 버튼 동시 표시 |
| 8 | 로그아웃 | Google 로그인 버튼 복원, 모든 찜 버튼 비활성화, 메모 입력란 제거 |
| 9 | 같은 계정 재로그인 | 테스트 찜과 저장한 빈 메모 다시 복원 |
| 10 | 두 번째 탭에서 이번에 만든 테스트 찜만 삭제 | 테스트 영화가 찜하기 상태로 돌아옴 |
| 11 | 첫 번째 탭의 오래된 입력란에서 저장 시도 | 실제 Firestore의 `No document to update` 실패. 성공 문구 없이 실패 안내 표시 |

저장 실패 안내: `저장하지 못했습니다. 네트워크 연결과 로그인·찜 상태를 확인해 주세요.`

문서 없음 오류의 실제 경로는 사용자 UID가 포함되므로 제출 기록에서 제외했습니다. 개발 도구의 issue 표시 역시 이 의도적인 오류 검증에 따른 것입니다. 네트워크 강제 차단이나 보안 규칙 변경에 의한 오류는 별도로 유발하지 않았습니다.

검증에는 새 찜 한 건만 사용했고 종료 전 제거했습니다. 기존 찜과 기존 메모는 수정하지 않았습니다. 메모 저장은 기존 문서 경로에 `memo`만 전달하는 구현이며 문서 ID·사용자 ID·영화 ID를 변경하는 코드가 없습니다.

## 캡처 자료

- `result-memo.png`: 실제 새로고침 후 수정 메모와 찜 복원 화면.
- `result-empty-memo.png`: 실제 빈 메모 저장 성공과 찜 유지 화면.
- `result-save-error.png`: 실제 문서 없음 오류에 대한 실패 안내 화면 (추가 증거).

이미지는 실제 브라우저 캡처이며 합성한 성공 화면이 아닙니다. 저장 형식만 JPEG에서 PNG로 변환했습니다. 실제 UID·토큰·환경 변수·로그인 인증 화면은 포함하지 않았습니다.

## 타입검사와 프로덕션 빌드

`npm ci` 성공 (113개 패키지, 원본 lock 유지), `npm run typecheck` 종료 코드 0.

```text
> day43-daily-base@0.1.0 typecheck
> tsc --noEmit
```

실제 로컬 설정을 적용한 `npm run build`도 종료 코드 0으로 통과했습니다.

```text
✓ Compiled successfully in 2.6s
  Running TypeScript ...
  Finished TypeScript in 1292ms ...
✓ Generating static pages using 7 workers (4/4) in 324ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ƒ /movies
└ ƒ /movies/[id]
```

개발 서버를 이용한 브라우저 기능 검증과 프로덕션 빌드 성공을 구분합니다. 프로덕션 서버의 별도 전체 브라우저 재검증이나 공개 배포는 수행하지 않았습니다.

실제 설정은 작업용 `.env.local`에만 보관하며 ZIP에는 빈 `.env.example`만 포함합니다. 선택 과제인 빈 메모 화면 필터는 구현하지 않았습니다.
