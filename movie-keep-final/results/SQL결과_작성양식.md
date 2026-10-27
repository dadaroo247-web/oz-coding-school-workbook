# SQL 실행 결과

이 파일은 `python3 scripts/verify_sql.py`가 제출 SQL 파일 4개를 직접 실행하여 생성한 실제 결과입니다. SQLite Fiddle 캡처가 아니라 Python 표준 라이브러리의 SQLite 실행 결과이며, 빈 문자열은 JSON의 `""`로 표시합니다.

- 실행 시각: 2026-10-27T11:07:07+09:00 (KST)
- Python: 3.9.6
- SQLite: 3.43.2
- 실행 환경: 매 단계 새 메모리 DB, 자동 커밋, 외래 키 ON
- 실행 순서: 00 → 01 → 새 DB의 00 → 02 → 새 DB의 00 → 03

## 1. 준비: 제약조건과 초기 데이터

```sql
PRAGMA foreign_keys = ON;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": null
}
```

```sql
DROP TABLE IF EXISTS favorites;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": null
}
```

```sql
DROP TABLE IF EXISTS movies;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": null
}
```

```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": null
}
```

```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  movieId INTEGER NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  UNIQUE (userId, movieId),
  FOREIGN KEY (movieId) REFERENCES movies(id)
);
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": null
}
```

```sql
INSERT INTO movies (id, title) VALUES
  (101, '인셉션'), (102, '인터스텔라'), (103, '다크 나이트'),
  (104, '테넷'), (105, '어벤져스'), (106, '어벤져스: 엔드게임');
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 6
}
```

```sql
INSERT INTO favorites (id, userId, movieId, memo) VALUES
  (1, 'user-a', 101, '주말에 볼 영화'),
  (2, 'user-b', 101, '친구가 추천한 영화'),
  (3, 'user-a', 102, ''),
  (4, 'user-c', 103, '다시 보고 싶은 영화'),
  (5, 'user-a', 104, '가족과 볼 영화'),
  (6, 'user-b', 105, ''),
  (7, 'user-c', 101, 'OST가 좋은 영화'),
  (8, 'user-a', 106, '친구와 볼 영화');
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 8
}
```

```sql
PRAGMA foreign_keys;
```

실제 결과:

```json
{
  "columns": ["foreign_keys"],
  "rows": [
    [1]
  ]
}
```

```sql
SELECT * FROM movies ORDER BY id ASC;
```

실제 결과:

```json
{
  "columns": ["id", "title"],
  "rows": [
    [101, "인셉션"],
    [102, "인터스텔라"],
    [103, "다크 나이트"],
    [104, "테넷"],
    [105, "어벤져스"],
    [106, "어벤져스: 엔드게임"]
  ]
}
```

```sql
SELECT * FROM favorites ORDER BY id ASC;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [1, "user-a", 101, "주말에 볼 영화"],
    [2, "user-b", 101, "친구가 추천한 영화"],
    [3, "user-a", 102, ""],
    [4, "user-c", 103, "다시 보고 싶은 영화"],
    [5, "user-a", 104, "가족과 볼 영화"],
    [6, "user-b", 105, ""],
    [7, "user-c", 101, "OST가 좋은 영화"],
    [8, "user-a", 106, "친구와 볼 영화"]
  ]
}
```

검증 통과: 외래 키 활성화 값 1, 영화 6건, 찜 8건 및 모든 초기 값 일치.

## 2. 조건 조회·JOIN·집계

### TODO 05

```sql
SELECT userId, memo
FROM favorites
WHERE movieId = 101;
```

실제 결과:

```json
{
  "columns": ["userId", "memo"],
  "rows": [
    ["user-a", "주말에 볼 영화"],
    ["user-b", "친구가 추천한 영화"],
    ["user-c", "OST가 좋은 영화"]
  ]
}
```

### TODO 06

```sql
SELECT memo
FROM favorites
WHERE userId = 'user-a' AND movieId = 104;
```

실제 결과:

```json
{
  "columns": ["memo"],
  "rows": [
    ["가족과 볼 영화"]
  ]
}
```

### TODO 07

```sql
SELECT movieId, memo
FROM favorites
WHERE userId = 'user-c'
ORDER BY movieId DESC
LIMIT 1;
```

실제 결과:

```json
{
  "columns": ["movieId", "memo"],
  "rows": [
    [103, "다시 보고 싶은 영화"]
  ]
}
```

### TODO 08

```sql
SELECT movieId, memo
FROM favorites
WHERE userId = 'user-c'
ORDER BY movieId DESC;
```

실제 결과:

```json
{
  "columns": ["movieId", "memo"],
  "rows": [
    [103, "다시 보고 싶은 영화"],
    [101, "OST가 좋은 영화"]
  ]
}
```

### TODO 14

```sql
SELECT favorites.userId, movies.title, favorites.memo
FROM favorites
JOIN movies ON favorites.movieId = movies.id
WHERE favorites.memo = ''
ORDER BY favorites.id ASC;
```

실제 결과:

```json
{
  "columns": ["userId", "title", "memo"],
  "rows": [
    ["user-a", "인터스텔라", ""],
    ["user-b", "어벤져스", ""]
  ]
}
```

### TODO 15

```sql
SELECT COUNT(*) AS emptyMemoCount
FROM favorites
WHERE memo = '';
```

실제 결과:

```json
{
  "columns": ["emptyMemoCount"],
  "rows": [
    [2]
  ]
}
```

### TODO 16

```sql
SELECT userId, COUNT(*) AS emptyMemoCount
FROM favorites
WHERE memo = ''
GROUP BY userId
ORDER BY userId ASC;
```

실제 결과:

```json
{
  "columns": ["userId", "emptyMemoCount"],
  "rows": [
    ["user-a", 1],
    ["user-b", 1]
  ]
}
```

검증 통과: LIMIT 조회는 1건, LIMIT 제외는 103 → 101이며 초기 8건은 그대로입니다. 전체 빈 메모 2건 = user-a 1건 + user-b 1건, user-c는 집계 결과에 없습니다.

## 3. CRUD: 새 메모리 DB에서 00-setup.sql을 다시 실행한 뒤 진행

```sql
INSERT INTO favorites (id, userId, movieId)
VALUES (30, 'user-b', 106);
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 1
}
```

```sql
SELECT * FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [30, "user-b", 106, ""]
  ]
}
```

```sql
SELECT COUNT(*) AS favoriteCount FROM favorites;
```

실제 결과:

```json
{
  "columns": ["favoriteCount"],
  "rows": [
    [9]
  ]
}
```

```sql
SELECT * FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [30, "user-b", 106, ""]
  ]
}
```

```sql
UPDATE favorites
SET memo = '주말에 다시 보기'
WHERE id = 30;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 1
}
```

```sql
SELECT * FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [30, "user-b", 106, "주말에 다시 보기"]
  ]
}
```

```sql
SELECT * FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [30, "user-b", 106, "주말에 다시 보기"]
  ]
}
```

```sql
DELETE FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 1
}
```

```sql
SELECT * FROM favorites WHERE id = 30;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": []
}
```

```sql
SELECT * FROM favorites ORDER BY id ASC;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [1, "user-a", 101, "주말에 볼 영화"],
    [2, "user-b", 101, "친구가 추천한 영화"],
    [3, "user-a", 102, ""],
    [4, "user-c", 103, "다시 보고 싶은 영화"],
    [5, "user-a", 104, "가족과 볼 영화"],
    [6, "user-b", 105, ""],
    [7, "user-c", 101, "OST가 좋은 영화"],
    [8, "user-a", 106, "친구와 볼 영화"]
  ]
}
```

검증 통과: memo 생략 INSERT는 빈 문자열/전체 9건, UPDATE는 id 30의 memo만 변경, DELETE는 id 30만 제거/전체 8건입니다. 모든 단계에서 초기 8건과 메모를 전부 비교해 보존을 확인했습니다.

## 4. 제약조건: 새 메모리 DB에서 00-setup.sql을 다시 실행한 뒤 진행

### 테스트 A

```sql
INSERT INTO favorites (id, userId, movieId)
VALUES (40, 'user-a', 101);
```

실제 결과: **예상한 실패**

```text
IntegrityError: UNIQUE constraint failed: favorites.userId, favorites.movieId
```

A 실패 이유: id는 40으로 달라도 (user-a, 101)이 기존 id 1의 조합과 같아 복합 UNIQUE를 위반합니다.

### 테스트 B

```sql
INSERT INTO favorites (id, userId, movieId)
VALUES (41, 'user-b', 106);
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 1
}
```

B 성공 이유: (user-b, 106)은 기존에 없고 영화 106은 존재합니다. 사용자마다 같은 영화를 찜할 수 있습니다.

### 테스트 C

```sql
INSERT INTO favorites (id, userId, movieId)
VALUES (42, 'user-b', 999);
```

실제 결과: **예상한 실패**

```text
IntegrityError: FOREIGN KEY constraint failed
```

C 실패 이유: movies.id에 999가 없어 외래 키를 위반합니다.

### 테스트 D

```sql
DELETE FROM movies WHERE id = 106;
```

실제 결과: **예상한 실패**

```text
IntegrityError: FOREIGN KEY constraint failed
```

D 실패 이유: 영화 106은 초기 id 8과 테스트 id 41의 찜이 참조하므로 기본 NO ACTION 외래 키 동작이 삭제를 막습니다.

### D 직후 상태

```sql
SELECT * FROM favorites ORDER BY id ASC;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [1, "user-a", 101, "주말에 볼 영화"],
    [2, "user-b", 101, "친구가 추천한 영화"],
    [3, "user-a", 102, ""],
    [4, "user-c", 103, "다시 보고 싶은 영화"],
    [5, "user-a", 104, "가족과 볼 영화"],
    [6, "user-b", 105, ""],
    [7, "user-c", 101, "OST가 좋은 영화"],
    [8, "user-a", 106, "친구와 볼 영화"],
    [41, "user-b", 106, ""]
  ]
}
```

```sql
SELECT COUNT(*) AS favoriteCount FROM favorites;
```

실제 결과:

```json
{
  "columns": ["favoriteCount"],
  "rows": [
    [9]
  ]
}
```

```sql
SELECT * FROM movies WHERE id = 106;
```

실제 결과:

```json
{
  "columns": ["id", "title"],
  "rows": [
    [106, "어벤져스: 엔드게임"]
  ]
}
```

### 테스트 데이터 정리

```sql
DELETE FROM favorites WHERE id = 41;
```

실제 결과:

```json
{
  "status": "success",
  "changedRows": 1
}
```

```sql
SELECT * FROM favorites ORDER BY id ASC;
```

실제 결과:

```json
{
  "columns": ["id", "userId", "movieId", "memo"],
  "rows": [
    [1, "user-a", 101, "주말에 볼 영화"],
    [2, "user-b", 101, "친구가 추천한 영화"],
    [3, "user-a", 102, ""],
    [4, "user-c", 103, "다시 보고 싶은 영화"],
    [5, "user-a", 104, "가족과 볼 영화"],
    [6, "user-b", 105, ""],
    [7, "user-c", 101, "OST가 좋은 영화"],
    [8, "user-a", 106, "친구와 볼 영화"]
  ]
}
```

검증 통과: A/C/D는 실제 제약조건 오류, B는 성공. D 직후 찜 9건과 영화 106 유지. id 41 정리 후 초기 찜 8건과 영화 6건 모두 보존. `PRAGMA foreign_key_check`는 0행입니다.

## 5. 검증 대상 파일 SHA-256

- `00-setup.sql`: `3760c8c1c2d620590afa40131f145b9ddb5fe4fdfa5711e3eec6ec4b8866831d`
- `01-queries.sql`: `6cdbbea2443cd8d04b9dce5cb1c211853c6ccd2a30ea0e8e4c59c429f156dbbc`
- `02-crud.sql`: `d2bb4c2ac4298d04fa28706211087af8e9b83d0ecaab260bd91dec9882836547`
- `03-constraints.sql`: `8e5543d9a747083417529a93d2b8ab14f2d4a4eb087895b3bd17cd468c5d5826`

**PASS — 149개 검증 조건 통과.**
