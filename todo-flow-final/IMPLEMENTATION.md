# TodoFlow 구현 및 검증 결과

검증일: 2026-10-15 (한국 시간)

## 전달 상태

- 필수 과제 **1, 3, 4, 5, 6, 7**과 선택 과제 **삭제·다크모드·useSettings**를 구현했습니다.
- 과제 **2**는 환경변수 기반 Firebase 초기화, 설정 누락·초기화 실패 안내, 설정 문서까지 구현했습니다. **사용자가 실제 Firebase 설정값을 입력하고 해당 프로젝트의 통신을 확인하는 단계는 남아 있습니다.**
- `.env.local.example`은 원본의 빈 템플릿 그대로 유지했습니다. `.env.local`은 만들지 않았으며, 실제 Firebase 설정값을 소스에 추가하지 않았습니다.
- 이 구현본은 사용자의 `dadaroo247-web/oz-coding-school-workbook` 저장소 `todo-flow-final` 폴더에 업로드하는 버전입니다. 웹 배포와 Firebase 프로젝트 생성은 아직 진행하지 않았습니다.

## 원본과 작업 경로

- 원본 저장소: https://github.com/ozedu5/frontend-final
- 기준 커밋: `20cb561fe30cad8331e679455ffc7658c42abb53`
- 워크북 내 구현 경로: `todo-flow-final/`
- 확인 결과 `package.json`, `src`, `.env.local.example`이 저장소 최상위에 있습니다. 과제 설명의 `cd todo-flow-final` 대신 실제 클론 폴더인 `frontend-final`을 사용했습니다.

## 검증 결과

| 검사 | 결과 | 범위 |
| --- | --- | --- |
| `npm install` | 성공 | 원본 의존성 설치 및 테스트 개발 의존성 추가 |
| `npm run lint` | 성공 | 오류 0, 경고 0 |
| `npm test` | 성공 | 3개 파일, 26개 테스트 |
| `npx tsc --noEmit` | 성공 | 소스 및 테스트 TypeScript 검사 |
| `npm run build` | 성공 | Next.js 16.2.9, TypeScript, 정적 페이지 생성까지 완료 |
| `git diff --check` | 성공 | 변경 파일의 공백 오류 없음 |
| 프로덕션 브라우저 확인 | 성공 | 아래 목록의 UI 동작 확인 |
| 실제 Firebase 프로젝트 통신 | 미실시 | 실제 설정값 미제공 |

검증 환경은 Node.js **24.21.0**, npm **11.19.0**입니다. 설치된 의존성의 엔진 범위를 반영해 `package.json`에 `^20.19.0 || ^22.13.0 || >=24.0.0`을 명시했습니다.

첫 빌드는 제한된 실행환경에서 빌드 도구의 내부 로컬 포트 사용이 막혀 실패했습니다. 허용된 실행환경에서 **동일한 `npm run build`를 다시 실행해 성공**했으며, 최종 소스와 테스트를 포함한 상태에서도 재검증했습니다. 린트·타입 검사를 끄거나 빌드 오류를 무시하는 설정은 추가하지 않았습니다.

설치 과정에서 npm의 의존성 설치 스크립트 안내가 있었지만, 설치·린트·테스트·빌드는 정상 완료됐습니다.

최종 빌드 경로:

```text
/             정적 생성 성공
/completed    정적 생성 성공
/_not-found   정적 생성 성공
```

### 자동 테스트 범위

Firestore 테스트는 SDK 함수를 모의해 동작을 검증합니다. 실제 서버 저장 성공이나 보안 규칙 검증을 의미하지 않습니다.

- Firebase 설정 누락·초기화 실패 처리, 기본 앱 재사용
- `onSnapshot`, `createdAt` 내림차순 쿼리, 스냅샷 반영, 언마운트 구독 해제
- 전체·진행 중·완료 필터, 완료 페이지의 고정 필터 우선 적용
- 빈 입력 차단, 입력 공백 제거, 서버 타임스탬프 저장, 저장 성공 후 입력 초기화
- 중복 추가·변경 차단, 저장 실패 시 입력 보존, 오류 후 재시도 가능 상태
- 완료/미완료 반전, 삭제가 완료 토글을 발생시키지 않음
- 구독·추가·변경·삭제 권한 오류 안내, 로딩·설정 누락 UI
- 실제 Redux/useSettings 연결, 테마·필터 localStorage 저장 및 새 store에서 복원

### 브라우저 확인 범위

`npm run start -- --hostname 127.0.0.1 --port 3000`으로 프로덕션 앱을 열어 다음을 확인했습니다.

- `/` 화면 정상 표시, Firebase 미설정 안내, 입력 및 추가 버튼 비활성화
- 다크/라이트 전환과 필터 선택에 따른 제목·선택 표시 변경
- 새로고침 후 다크 테마 및 진행 중 필터 유지
- `/completed` 진입과 직접 새로고침, 완료 필터 유지
- 완료 페이지에서 진행 중 필터 선택 시 `/`로 이동
- 검사 중 브라우저 콘솔의 warning/error 기록 없음

[라이트 모드 실행 화면](./docs/screenshots/light.jpg) · [완료 페이지 다크 모드 실행 화면](./docs/screenshots/completed-dark.jpg)

이 화면들은 실제 Firebase가 연결되지 않은 상태입니다. 실제 항목의 저장·새로고침 후 유지·두 창 간 실시간 동기화는 Firebase 연결 후 README의 수동 확인 목록에 따라 확인해야 합니다.

## 수정·추가 파일

| 파일 | 변경 내용 |
| --- | --- |
| `src/types/todo.ts` | Todo 구조 유지, FilterType/ThemeType 리터럴 타입 완성 |
| `src/store/todoSlice.ts` | toggleTheme, setFilter reducer 구현 |
| `src/store/storage.ts` | SSR 대체 스토리지의 불필요한 인수 제거, 린트 경고 해결 |
| `src/hooks/useSettings.ts` | 타입이 지정된 Redux 접근 및 안정적인 dispatch 콜백 |
| `src/lib/firebase.ts` | 실제 환경변수만 사용, 누락·초기화 실패 처리, HMR 기본 앱 재사용 |
| `src/lib/firestoreError.ts` (추가) | 권한·네트워크·삭제된 문서 오류의 사용자 안내 |
| `src/components/todo/TodoInput.tsx` | addDoc, serverTimestamp, 입력 검증, 중복 저장 방지, 오류 안내 |
| `src/components/todo/TodoList.tsx` | onSnapshot 구독, 필터, updateDoc, deleteDoc, 로딩/빈 목록/오류 처리 |
| `src/components/layout/Navbar.tsx` | useSettings 사용, 페이지 이동·필터 연결, 접근성 이름·선택 상태 |
| `src/components/layout/ThemeWrapper.tsx` | Redux 테마를 화면 전체에 적용 |
| `src/app/globals.css` | 라이트/다크 색상, 반응형 배치, 버튼·입력·목록·상태 화면 스타일 |
| `src/app/layout.tsx` | 빌드 시 외부 Google Fonts 다운로드 의존성 제거, 시스템 글꼴 사용 |
| `src/app/page.tsx` | useSettings 필터 제목 및 메인 화면 |
| `src/app/completed/page.tsx` | 완료 필터 초기화 및 TodoList 고정 필터로 완료 목록 보장 |
| `package.json` | 테스트 실행 스크립트·개발 의존성·Node 지원 범위 |
| `package-lock.json` | 설치 결과 및 테스트 도구 버전 고정 |
| `vitest.config.mts` (추가) | 테스트 환경과 경로 별칭 |
| `tests/firebase.test.ts` (추가) | Firebase 설정 분기 테스트 4개 |
| `tests/settings.test.tsx` (추가) | Redux·훅·테마·필터·저장 복원 테스트 4개 |
| `tests/todos.test.tsx` (추가) | 할 일 CRUD·실시간 구독·오류·필터 테스트 18개 |
| `README.md` | 실행·Firebase 설정·과제 매핑·수동 검증 안내 |
| `IMPLEMENTATION.md` (추가) | 본 결과 보고서 |

`.env.local.example`, `.gitignore`, 원본 과제 `GUIDE.md`는 유지했습니다.

## 실행 및 남은 설정

워크북의 `todo-flow-final` 폴더에서 다음을 실행합니다.

```bash
npm install
cp .env.local.example .env.local
# .env.local의 6개 NEXT_PUBLIC_FIREBASE_* 항목에 실제 웹 앱 설정값을 입력합니다.
npm run dev
```

실제 설정값을 입력하기 전에도 `npm run dev`로 설정 안내·테마·필터를 확인할 수 있습니다. Firebase의 기본 `(default)` Firestore를 생성하고 읽기·쓰기 규칙을 확인해야 실제 할 일을 사용할 수 있습니다. 세부 절차는 [README.md](./README.md)에 있습니다.

업로드 대상에는 소스, 설정 예제, lockfile, 테스트, 문서와 실행 화면을 포함했습니다. `node_modules`, `.next`, 캐시와 실제 환경설정 파일은 제외했습니다.
