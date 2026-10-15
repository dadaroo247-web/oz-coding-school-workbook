> **TodoFlow — 실시간 할 일 관리 앱**
>
> 지금까지 배운 프론트엔드 기술을 하나의 프로젝트에서 모두 활용합니다.
>
> | 기술 | 역할 |
> | --- | --- |
> | **TypeScript** | Todo, Filter 등 데이터 타입 안전하게 정의 |
> | **Firebase Firestore** | 할 일 CRUD + 실시간(onSnapshot) 동기화 |
> | **Redux Toolkit** | 다크/라이트 테마, 필터 상태 전역 관리 |
> | **Next.js** | `/` (전체 목록), `/completed` (완료 목록) 페이지 라우팅 |

---

## 구현 기능

- [ ]  **[과제 1]** TypeScript: `Todo` 인터페이스와 `FilterType`, `ThemeType` 리터럴 타입 정의
- [ ]  **[과제 2]** Firebase: `.env.local`에 Firebase 설정값 채우고 Firestore 초기화 확인
- [ ]  **[과제 3]** Redux: `toggleTheme`, `setFilter` reducer 완성
- [ ]  **[과제 4]** Firebase 실시간 읽기: `onSnapshot`으로 할 일 목록 불러오기
- [ ]  **[과제 5]** Firebase 쓰기: `addDoc`으로 새 할 일 추가
- [ ]  **[과제 6]** Firebase 수정: `updateDoc`으로 완료/미완료 토글
- [ ]  **[과제 7]** Next.js 라우팅: `/completed` 페이지에서 완료된 항목만 표시 (이미 동작하는 예시 코드 포함 — 동작 원리를 이해하면 됩니다)

**추가 과제 (선택)**

- [ ]  `deleteDoc`으로 할 일 삭제 기능 구현
- [ ]  Redux `theme` 상태로 다크모드 UI 전체 적용 (`ThemeWrapper.tsx`)
- [ ]  `useSettings` 커스텀 훅 완성

깃허브 링크 / 실행 화면 제출

---

## 1. 시작하기 (클론 & 실행)

이번 과제는 스켈레톤 저장소를 클론해서 시작합니다. (직접 `create-next-app`을 칠 필요 없습니다)

### 1단계 — 저장소 클론

```bash
git clone <이 저장소 주소>
cd todo-flow-final
npm install
```

### 2단계 — Firebase 프로젝트 연결 (과제 2)

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트를 만들고 **Firestore Database**를 활성화하세요. (테스트 모드로 시작해도 됩니다)
2. 프로젝트 설정 → 내 앱 → 웹 앱 추가 → SDK 설정 및 구성 값을 확인하세요.
3. `.env.local.example`을 복사해 `.env.local`을 만들고 값을 채우세요.

```bash
cp .env.local.example .env.local
```

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> ⚠️ `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다. Firebase 키를 `firebase.ts`에 직접 적지 마세요.

### 3단계 — 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 자동 오픈

---

## 2. 과제 진행 방법

### 수정할 파일

| 파일 | 과제 |
| --- | --- |
| `src/types/todo.ts` | 과제 1 |
| `.env.local` | 과제 2 |
| `src/store/todoSlice.ts` | 과제 3 |
| `src/components/todo/TodoList.tsx` | 과제 4, 6 + 추가 과제 1 |
| `src/components/todo/TodoInput.tsx` | 과제 5 |
| `src/app/completed/page.tsx` | 과제 7 (참고용, 이미 구현됨) |
| `src/components/layout/ThemeWrapper.tsx` | 추가 과제 (다크모드 색상) |
| `src/hooks/useSettings.ts` | 추가 과제 (커스텀 훅) |

### 과제 순서 (권장)

```
과제 1 (types/todo.ts)   →  과제 2 (.env.local + firebase.ts 확인)
       ↓
과제 3 (todoSlice.ts)    →  과제 4 (TodoList: onSnapshot)
       ↓
과제 5 (TodoInput: addDoc)  →  과제 6 (TodoList: updateDoc)
       ↓
과제 7 (completed 페이지 동작 확인) → 추가 과제 (선택)
```

---

## 3. 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 전역 레이아웃 (Providers + ThemeWrapper + Navbar)
│   ├── page.tsx                # 메인 페이지 (/) — 전체/진행 중 목록
│   └── completed/
│       └── page.tsx            # 완료 페이지 (/completed)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # 테마 토글 + 필터 버튼 + 페이지 링크
│   │   └── ThemeWrapper.tsx    # Redux theme 상태로 전체 배경색 변경
│   ├── common/
│   │   └── Providers.tsx       # Redux + Persist 설정 래퍼
│   └── todo/
│       ├── TodoInput.tsx       # 할 일 입력 폼
│       └── TodoList.tsx        # 실시간 할 일 목록
├── hooks/
│   └── useSettings.ts          # 추가 과제: theme/filter 커스텀 훅
├── store/
│   ├── index.ts                # Store 생성
│   ├── todoSlice.ts            # theme + filter 상태
│   └── storage.ts              # SSR 대응 스토리지
├── types/
│   └── todo.ts                 # TypeScript 타입 정의
└── lib/
    └── firebase.ts             # Firebase 초기화 (.env.local 기반)
```

> 💡 저장소는 `npm run build`, `npm run lint`가 처음부터 에러 없이 통과하도록 구성되어 있습니다. TODO를 채우지 않은 상태에서는 기능이 동작하지 않을 뿐, 빌드/린트가 깨지지는 않습니다.

---

## 4. 핵심 코드 가이드

### 1단계: TypeScript 타입 정의 (`src/types/todo.ts`)

```tsx
import type { Timestamp } from 'firebase/firestore';

// 💡 [과제 1] 아래 타입들을 완성하세요.

export interface Todo {
  id: string;
  text: string;
  isDone: boolean;
  createdAt: Timestamp | null;
}

// 필터는 '전체', '진행 중', '완료' 세 가지만 가능
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: 'all' | '진행 중' | '완료' 형태로 작성하세요
export type FilterType = any;

// 테마는 라이트/다크 두 가지만 가능
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: 'light' | 'dark' 형태로 작성하세요
export type ThemeType = any;
```

---

### 2단계: Firebase 설정 (`src/lib/firebase.ts`)

이미 `.env.local`을 읽도록 구현되어 있습니다. **과제 2는 코드를 고치는 게 아니라, `.env.local`에 실제 Firebase 프로젝트 값을 채우는 것**입니다.

```tsx
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

### 3단계: Redux 설정

### Slice 생성 (`src/store/todoSlice.ts`)

```tsx
export const todoSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 💡 [과제 3-1] 테마를 토글하세요. (light ↔ dark)
    toggleTheme: (state) => {
      /* 코드를 작성하세요 */
    },
    // 💡 [과제 3-2] 외부에서 받은 값으로 필터를 변경하세요.
    setFilter: (state, action: PayloadAction<FilterType>) => {
      /* 코드를 작성하세요 */
    },
  },
});
```

`storage.ts`, `index.ts`, `Providers.tsx`, `Navbar.tsx`는 이미 완성되어 있으니 그대로 사용하세요.

---

### 4단계: 할 일 컴포넌트

### TodoInput (`src/components/todo/TodoInput.tsx`)

```tsx
import { db } from '@/lib/firebase';
// 💡 [과제 5-hint] addDoc, collection, serverTimestamp를 import하세요.
import {} from 'firebase/firestore';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (text.trim() === '') return;

  // 💡 [과제 5] "todos" 컬렉션에 { text, isDone: false, createdAt: serverTimestamp() }를 저장하세요.
  /* 코드를 작성하세요 */

  setText('');
};
```

### TodoList (`src/components/todo/TodoList.tsx`)

```tsx
import { db } from '@/lib/firebase';
import { Todo } from '@/types/todo';
// 💡 import할 Firestore 함수: collection, query, orderBy, onSnapshot, updateDoc, doc
import {} from 'firebase/firestore';

// 💡 [과제 4] onSnapshot으로 "todos" 컬렉션을 실시간 구독하세요.
//    createdAt 기준 내림차순(desc) 정렬
//    가져온 데이터를 setTodos로 업데이트하세요.
//    컴포넌트 언마운트 시 구독을 해제하는 클린업 함수를 return하세요.
useEffect(() => {
  /* 코드를 작성하세요 */
}, []);

// 💡 [과제 6] 완료/미완료 토글 — updateDoc으로 isDone 값을 반전시키세요.
const handleToggle = async (todo: Todo) => {
  /* 코드를 작성하세요 */
};

// 💡 [추가 과제 1] deleteDoc으로 할 일을 삭제하는 함수를 작성하고,
//    <li> 안에 삭제 버튼을 추가해 연결하세요.
//    import { deleteDoc, doc } from 'firebase/firestore';
//    const handleDelete = async (id: string) => { await deleteDoc(doc(db, 'todos', id)); };
```

---

### 5단계: Next.js 페이지 구성

`src/app/layout.tsx`, `src/app/page.tsx`는 이미 완성되어 있습니다.

### 완료 페이지 — `/completed` (`src/app/completed/page.tsx`)

이 페이지는 이미 동작하는 예시로 제공됩니다. TodoList를 재활용하면서, 진입 시 Redux `filter`를 `'완료'`로 고정하는 방식입니다. **코드를 직접 수정할 필요는 없지만, 동작 원리(useEffect + dispatch)를 이해하고 넘어가세요.**

```tsx
'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setFilter } from '@/store/todoSlice';
import TodoList from '@/components/todo/TodoList';

export default function CompletedPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setFilter('완료'));
  }, [dispatch]);

  return (
    <>
      <h1 style={{ marginBottom: '20px' }}>✅ 완료된 할 일</h1>
      <TodoList />
    </>
  );
}
```

---

## 5. 추가 과제 (선택)

### 추가 과제 1 — 할 일 삭제

`TodoList.tsx`에 삭제 버튼을 추가하고 `deleteDoc`으로 Firestore 문서를 삭제하세요.

```tsx
import { deleteDoc, doc } from 'firebase/firestore';

const handleDelete = async (id: string) => {
  // 💡 "todos" 컬렉션에서 해당 id의 문서를 삭제하세요.
  /* 코드를 작성하세요 */
};
```

```tsx
// TodoList의 <li> 안에 삭제 버튼 추가
<button
  onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}
  style={{ padding: '4px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
>
  삭제
</button>
```

### 추가 과제 2 — 다크모드 색상 적용 (`ThemeWrapper.tsx`)

```tsx
style={{
  // 💡 [추가 과제] theme 값에 따라 배경색과 글자색을 삼항 연산자로 설정하세요.
  //    예: theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
  backgroundColor: undefined /* TODO */,
  color: undefined /* TODO */,
  minHeight: '100vh',
  transition: 'all 0.3s',
}}
```

### 추가 과제 3 — Custom Hook (`src/hooks/useSettings.ts`)

```tsx
export const useSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, filter } = useSelector((state: RootState) => state.ui);

  return {
    theme,
    filter,
    handleToggleTheme: () => {
      /* 코드를 작성하세요 */
    },
    handleSetFilter: (f: FilterType) => {
      /* 코드를 작성하세요 */
    },
  };
};
```

---

## 6. 테스트 체크리스트

- [ ]  할 일을 입력하고 추가 버튼을 누르면 목록에 표시된다
- [ ]  항목을 클릭하면 완료/미완료가 토글된다
- [ ]  페이지를 새로고침해도 목록이 유지된다 (Firestore)
- [ ]  Navbar의 필터 버튼을 누르면 목록이 필터링된다 (Redux)
- [ ]  `/completed` 페이지에서는 완료 항목만 보인다 (Next.js 라우팅)
- [ ]  테마 버튼을 누르면 다크/라이트 모드가 전환된다 (Redux + ThemeWrapper)
- [ ]  페이지를 새로고침해도 테마와 필터 상태가 유지된다 (redux-persist)
- [ ]  `npm run build`, `npm run lint`가 에러 없이 통과한다

---

## 7. 제출

- GitHub 저장소 링크 또는 실행 화면 스크린샷 제출
- 추가 과제 구현 시 별도 표시
