-- 과제 3: 이 파일을 먼저 완성합니다. 과제 전용 SQLite Fiddle에서만 실행하세요.
-- 주의: 실행할 때마다 실습 테이블을 삭제하고 영화 6건·찜 8건으로 초기화합니다.
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE favorites (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
  movieId INTEGER NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  -- TODO 12 완료: 같은 사용자가 같은 영화를 두 번 찜할 수 없습니다.
  UNIQUE (userId, movieId),
  -- TODO 13 완료: 존재하는 영화만 찜할 수 있고 참조 중인 영화 삭제를 차단합니다.
  FOREIGN KEY (movieId) REFERENCES movies(id)
);

INSERT INTO movies (id, title) VALUES
  (101, '인셉션'), (102, '인터스텔라'), (103, '다크 나이트'),
  (104, '테넷'), (105, '어벤져스'), (106, '어벤져스: 엔드게임');
INSERT INTO favorites (id, userId, movieId, memo) VALUES
  (1, 'user-a', 101, '주말에 볼 영화'),
  (2, 'user-b', 101, '친구가 추천한 영화'),
  (3, 'user-a', 102, ''),
  (4, 'user-c', 103, '다시 보고 싶은 영화'),
  (5, 'user-a', 104, '가족과 볼 영화'),
  (6, 'user-b', 105, ''),
  (7, 'user-c', 101, 'OST가 좋은 영화'),
  (8, 'user-a', 106, '친구와 볼 영화');

PRAGMA foreign_keys;
SELECT * FROM movies ORDER BY id ASC;
SELECT * FROM favorites ORDER BY id ASC;
