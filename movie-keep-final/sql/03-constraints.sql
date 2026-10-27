-- 과제 6: 00-setup.sql로 초기화하고 A → B → C → D를 한 문장씩 실행합니다.
-- A/C/D의 오류는 제약조건이 정상 작동한다는 기대 결과입니다.
-- 오류로 실행을 중단하는 도구에서는 다음 문장을 별도로 실행합니다.

-- A: 다른 id라도 동일한 사용자+영화 조합은 UNIQUE 위반으로 실패합니다.
INSERT INTO favorites (id, userId, movieId)
VALUES (40, 'user-a', 101);

-- B: 같은 영화라도 다른 사용자이므로 성공합니다.
INSERT INTO favorites (id, userId, movieId)
VALUES (41, 'user-b', 106);

-- C: 존재하지 않는 영화는 FOREIGN KEY 위반으로 실패합니다.
INSERT INTO favorites (id, userId, movieId)
VALUES (42, 'user-b', 999);

-- D: 찜에서 참조 중인 영화는 FOREIGN KEY 위반으로 삭제되지 않습니다.
DELETE FROM movies WHERE id = 106;

-- D 실행 후: 초기 8건과 id 41을 합쳐 찜 9건, 영화 106 유지.
SELECT * FROM favorites ORDER BY id ASC;
SELECT COUNT(*) AS favoriteCount FROM favorites;
SELECT * FROM movies WHERE id = 106;

-- 검증이 모두 기대대로 끝난 후 테스트용 찜만 정리합니다.
DELETE FROM favorites WHERE id = 41;

SELECT * FROM favorites ORDER BY id ASC;
-- 초기 id 1~8의 찜과 메모가 그대로 복원됩니다.
-- A/C/D가 예상과 다르게 성공하면 제약조건을 수정하고 초기화부터 다시 검증하세요.
