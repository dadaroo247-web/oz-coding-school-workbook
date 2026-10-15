# TodoFlow 최종 구현 및 검증 결과

검증일: 2026-10-15 (한국 시간)

## 완료한 과제

필수 과제 **1~7**과 선택 과제 **삭제·다크모드·useSettings**를 모두 구현하고 검증했습니다. 실제 Firebase 프로젝트를 생성하고 웹 앱 설정과 Firestore 접근 규칙까지 연결했습니다.

| 구분 | 구현 내용 | 주요 파일 |
| --- | --- | --- |
| 과제 1 | Todo 인터페이스, FilterType·ThemeType 리터럴 타입 | `src/types/todo.ts` |
| 과제 2 | 실제 Spark 프로젝트, 웹 앱·서울 Firestore 생성, 환경변수 연결 및 초기화 | `src/lib/firebase.ts`, `.env.local.example` |
| 과제 3 | toggleTheme, setFilter reducer | `src/store/todoSlice.ts` |
| 과제 4 | onSnapshot 실시간 읽기, createdAt 내림차순 정렬, 구독 해제 | `src/components/todo/TodoList.tsx` |
| 과제 5 | addDoc, serverTimestamp, 공백 입력 차단 및 중복 저장 방지 | `src/components/todo/TodoInput.tsx` |
| 과제 6 | updateDoc으로 완료·미완료 반전 | `src/components/todo/TodoList.tsx` |
| 과제 7 | TodoList 재사용 및 고정 완료 필터로 /completed 구현 | `src/app/completed/page.tsx` |
| 선택: 삭제 | deleteDoc, 완료 토글과 별개로 처리 | `src/components/todo/TodoList.tsx` |
| 선택: 다크모드 | Redux 테마에 따라 배경·입력·목록·안내 색상 적용 | `src/components/layout/ThemeWrapper.tsx`, `src/app/globals.css` |
| 선택: 커스텀 훅 | 타입이 지정된 Redux 상태 접근과 안정적인 변경 함수 | `src/hooks/useSettings.ts` |

## 검증 결과

| 검사 | 결과 | 검증 범위 |
| --- | --- | --- |
| npm install | 성공 | 원본 의존성 및 테스트 개발 의존성 설치 |
| npm run lint | 성공 | 오류 0, 경고 0 |
| npm test | 성공 | 3개 파일, 26개 테스트 |
| npx tsc --noEmit | 성공 | 소스와 테스트 타입 검사 |
| npm run build | 성공 | 실제 .env.local 적용, Next.js TypeScript 검사 및 정적 페이지 생성 |
| git diff --check | 성공 | 변경 파일 공백 검사 |
| 실제 Firebase CRUD | 성공 | 추가·완료/미완료 변경·임시 항목 삭제·새로고침 유지 |
| 두 창 간 실시간 동기화 | 성공 | 추가·상태 변경·삭제가 다른 창에 자동 반영 |
| 실제 데이터 필터·라우팅 | 성공 | 전체·진행 중·완료, 완료 페이지 직접 새로고침 |
| 테마·필터 설정 유지 | 성공 | 실제 브라우저 새로고침 후 복원 |

검증 환경: Node.js **24.21.0**, npm **11.19.0**, Next.js **16.2.9**. 지원 Node 범위는 `^20.19.0 || ^22.13.0 || >=24.0.0`입니다.

빌드는 `/`, `/completed`, `/_not-found`를 정상 생성했습니다. 제한된 실행환경의 빌드 도구 로컬 포트 제약은 허용된 실행환경에서 같은 명령을 실행해 해결했습니다. 린트나 타입 검사를 끄지 않았습니다.

자동 테스트는 Firebase SDK를 모의하며 설정 누락·초기화 실패, 구독과 해제, 필터, 추가·토글·삭제, 권한 오류, 입력 보존, 중복 요청 방지, Redux·localStorage 복원을 검증합니다. 실제 서버 검증은 위 표와 [Firebase 연결 현황](./FIREBASE_STATUS.md)에 별도로 기록했습니다.

## Firebase 연결

- 프로젝트: TodoFlow (`todoflow-27381`), 무료 Spark
- 웹 앱: TodoFlow Web
- Firestore: Standard, `(default)`, `asia-northeast3`(서울)
- 실제 설정값은 Git에서 제외된 로컬 `.env.local`에만 저장했습니다.
- `.env.local.example`은 원본의 빈 템플릿으로 유지했습니다.
- 사용자가 승인한 `firestore.rules`를 게시했고, todos 외 경로는 차단합니다.
- 공동 목록 접근 만료: **2026-11-14 09:00 (한국 시간)**. Spark 요금제의 종료일이 아닙니다.

공개 GitHub 저장소를 새로 복제하면 해당 환경의 `.env.local`을 별도로 채워야 합니다. [README](./README.md)에 설정 절차가 있습니다.

## 원본과 저장 위치

- 원본 스켈레톤: https://github.com/ozedu5/frontend-final
- 기준 커밋: `20cb561fe30cad8331e679455ffc7658c42abb53`
- 제출 저장소: https://github.com/dadaroo247-web/oz-coding-school-workbook/tree/main/todo-flow-final
- 워크북 폴더: `todo-flow-final/`

원본은 최상위에 package.json과 src가 있는 구조여서 `frontend-final`에 클론했습니다. 워크북에는 별도 `todo-flow-final` 폴더로 추가했습니다.

## 수정·추가 파일

- 타입·상태: `src/types/todo.ts`, `src/store/todoSlice.ts`, `src/store/storage.ts`, `src/hooks/useSettings.ts`
- Firebase·오류·규칙: `src/lib/firebase.ts`, `src/lib/firestoreError.ts`, `firestore.rules`
- 할 일 입력·목록: `src/components/todo/TodoInput.tsx`, `src/components/todo/TodoList.tsx`
- 전체 테마·탐색: `src/components/layout/ThemeWrapper.tsx`, `src/components/layout/Navbar.tsx`
- 페이지·스타일: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/completed/page.tsx`, `src/app/globals.css`
- 테스트: `tests/firebase.test.ts`, `tests/settings.test.tsx`, `tests/todos.test.tsx`, `vitest.config.mts`
- 의존성·실행 명령: `package.json`, `package-lock.json`
- 문서·화면: `README.md`, `IMPLEMENTATION.md`, `FIREBASE_STATUS.md`, `docs/screenshots/`
- 워크북 첫 화면: 최상위 `README.md`에 과제 링크와 실행 방법 추가

`.gitignore`, `.env.local.example`, 원본 과제 `GUIDE.md`는 유지했습니다. Google Fonts의 빌드 시 외부 다운로드를 제거하고 시스템 글꼴을 사용했습니다.

## 실제 실행 화면

완료·진행 중 예시 2개를 실제 Firestore에 남겼습니다. 삭제 기능 검증용 임시 항목은 검증 후 제거했습니다.

![실제 Firebase 목록](./docs/screenshots/light.jpg)

![실제 Firebase 완료 페이지 다크 모드](./docs/screenshots/completed-dark.jpg)

압축본과 GitHub에는 소스·설정 예제·lockfile·테스트·규칙·문서·실행 화면을 포함했습니다. `.env.local`, `.git`, node_modules, .next 및 캐시는 제외했습니다.
