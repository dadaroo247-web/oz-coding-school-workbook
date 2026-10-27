-- 과제 5: 완성한 00-setup.sql로 초기화한 뒤 위에서 아래로 한 단계씩 실행합니다.
-- 매 단계 SQL과 SELECT를 함께 기록하세요. 같은 INSERT를 반복하지 않습니다.

-- TODO 09 완료: memo 열을 생략하여 기본값인 빈 문자열로 추가.
INSERT INTO favorites (id, userId, movieId)
VALUES (30, 'user-b', 106);

SELECT * FROM favorites WHERE id = 30;
-- 기대: (30, user-b, 106, 빈 문자열), 전체 9건.
SELECT COUNT(*) AS favoriteCount FROM favorites;

-- 수정 대상 확인(제공 코드)
SELECT * FROM favorites WHERE id = 30;
-- TODO 10 완료: 지정한 찜의 메모만 수정.
UPDATE favorites
SET memo = '주말에 다시 보기'
WHERE id = 30;

SELECT * FROM favorites WHERE id = 30;
-- 기대: memo만 바뀌고 id/userId/movieId는 유지.

-- 삭제 대상 확인(제공 코드)
SELECT * FROM favorites WHERE id = 30;
-- TODO 11 완료: 지정한 찜 한 건만 삭제.
DELETE FROM favorites WHERE id = 30;

SELECT * FROM favorites WHERE id = 30;
-- 기대: 0행.
SELECT * FROM favorites ORDER BY id ASC;
-- 기대: 초기 id 1~8의 찜과 메모가 그대로 유지.
