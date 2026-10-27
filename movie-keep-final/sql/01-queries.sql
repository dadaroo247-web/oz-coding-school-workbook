-- 과제 4·7: 00-setup.sql 실행 직후의 초기 데이터에서 한 문장씩 실행합니다.

-- TODO 05 완료: 영화 101의 사용자와 메모 (3행).
SELECT userId, memo
FROM favorites
WHERE movieId = 101;

-- TODO 06 완료: AND로 사용자와 영화 조건을 모두 만족하는 메모 조회.
SELECT memo
FROM favorites
WHERE userId = 'user-a' AND movieId = 104;

-- TODO 07 완료: user-c의 영화 ID 내림차순 중 첫 1건.
SELECT movieId, memo
FROM favorites
WHERE userId = 'user-c'
ORDER BY movieId DESC
LIMIT 1;

-- TODO 08 완료: LIMIT만 제외하여 user-c의 모든 찜 조회 (103 → 101).
SELECT movieId, memo
FROM favorites
WHERE userId = 'user-c'
ORDER BY movieId DESC;

-- TODO 14 완료: 영화 테이블을 JOIN하여 빈 메모인 찜의 영화 제목 조회.
SELECT favorites.userId, movies.title, favorites.memo
FROM favorites
JOIN movies ON favorites.movieId = movies.id
WHERE favorites.memo = ''
ORDER BY favorites.id ASC;

-- TODO 15 완료: 빈 메모 전체 건수. 결과 열은 emptyMemoCount 하나입니다.
SELECT COUNT(*) AS emptyMemoCount
FROM favorites
WHERE memo = '';

-- TODO 16 완료: 빈 메모만 골라 사용자별로 집계. user-c는 포함되지 않습니다.
SELECT userId, COUNT(*) AS emptyMemoCount
FROM favorites
WHERE memo = ''
GROUP BY userId
ORDER BY userId ASC;
