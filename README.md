# OZ 코딩스쿨 워크북

OZ 코딩스쿨에서 배운 내용을 복습하고 일별 과제를 정리하는 워크북입니다.

## 과제 목록

| 날짜 | 과제 | 학습 내용 |
| --- | --- | --- |
| Day 40 | [Zustand 카운터](./day40-zustand) | Store 생성, 상태 변경, selector 사용 |

## Day 40 실행

```bash
cd day40-zustand
npm install
npm run dev
```

브라우저에서 http://localhost:3000 에 접속합니다.

초기값은 0이며, +1·-1·Reset 버튼으로 값을 변경합니다.

## 실행 결과

`+1 → +1 → +1 → -1` 순서로 클릭하면 2가 표시됩니다.

![Day 40 카운터 결과](./day40-zustand/result.png)

## 검증

- `npm run build` 및 TypeScript 검사 통과
- 초기값, 증가, 감소, 음수, Reset 동작 확인
- 브라우저 콘솔 오류 없음

새 과제는 `day41-과제이름`처럼 별도 폴더에 추가합니다.
