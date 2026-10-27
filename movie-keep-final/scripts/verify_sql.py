#!/usr/bin/env python3
"""제출 SQL을 SQLite에서 실행·검증하고 실제 결과 Markdown을 생성합니다.

실행: 프로젝트 루트에서 python3 scripts/verify_sql.py
외부 패키지나 기존 DB 없이 매 검증 단계마다 메모리 DB를 사용합니다.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
INITIAL = [
    (1, 'user-a', 101, '주말에 볼 영화'),
    (2, 'user-b', 101, '친구가 추천한 영화'),
    (3, 'user-a', 102, ''),
    (4, 'user-c', 103, '다시 보고 싶은 영화'),
    (5, 'user-a', 104, '가족과 볼 영화'),
    (6, 'user-b', 105, ''),
    (7, 'user-c', 101, 'OST가 좋은 영화'),
    (8, 'user-a', 106, '친구와 볼 영화'),
]
MOVIES = [(101, '인셉션'), (102, '인터스텔라'), (103, '다크 나이트'),
          (104, '테넷'), (105, '어벤져스'), (106, '어벤져스: 엔드게임')]
COLS = ['id', 'userId', 'movieId', 'memo']
checks = 0
report = []


def check(condition, message):
    global checks
    if not condition:
        raise AssertionError(message)
    checks += 1


def statements(filename):
    """이 과제의 한 줄 주석을 제외하고 SQLite 완결 문장 기준으로 분리."""
    buffer = ''
    for line in (ROOT / 'sql' / filename).read_text(encoding='utf-8').splitlines():
        if line.lstrip().startswith('--'):
            continue
        buffer += line + '\n'
        if sqlite3.complete_statement(buffer):
            yield buffer.strip()
            buffer = ''
    check(not buffer.strip(), f'{filename}: 미완성 SQL 문장')


def run(db, sql, expected_error=None, record=True):
    try:
        cursor = db.execute(sql)
        columns = [item[0] for item in cursor.description] if cursor.description else []
        rows = cursor.fetchall() if columns else []
    except sqlite3.IntegrityError as error:
        if expected_error is None:
            raise
        check(str(error) == expected_error, f'예상과 다른 오류: {error}')
        if record:
            report.append(f'```sql\n{sql}\n```\n\n실제 결과: **예상한 실패**\n\n```text\n{type(error).__name__}: {error}\n```\n')
        return None
    check(expected_error is None, f'실패해야 하는 SQL이 성공함: {sql}')
    if record:
        result = {'columns': columns, 'rows': rows} if columns else {'status': 'success', 'changedRows': cursor.rowcount if cursor.rowcount >= 0 else None}
        if columns:
            row_text = ',\n'.join('    ' + json.dumps(row, ensure_ascii=False) for row in rows)
            rows_text = '[\n' + row_text + '\n  ]' if rows else '[]'
            result_text = '{\n  \"columns\": ' + json.dumps(columns, ensure_ascii=False) + ',\n  \"rows\": ' + rows_text + '\n}'
        else:
            result_text = json.dumps(result, ensure_ascii=False, indent=2)
        report.append(f'```sql\n{sql}\n```\n\n실제 결과:\n\n```json\n{result_text}\n```\n')
    return columns, rows


def favorites(db):
    return db.execute('SELECT id, userId, movieId, memo FROM favorites ORDER BY id').fetchall()


def setup(record=False):
    db = sqlite3.connect(':memory:', isolation_level=None)
    sqls = list(statements('00-setup.sql'))
    check(len(sqls) == 10, '준비 SQL 문장 수 변경: 검증 코드 확인 필요')
    for sql in sqls:
        run(db, sql, record=record)
    check(db.execute('PRAGMA foreign_keys').fetchone() == (1,), '외래 키 검사 비활성')
    check(db.execute('SELECT * FROM movies ORDER BY id').fetchall() == MOVIES, '초기 영화 불일치')
    check(favorites(db) == INITIAL, '초기 찜 불일치')
    return db


def main():
    report.append('# SQL 실행 결과\n')
    report.append('이 파일은 `python3 scripts/verify_sql.py`가 제출 SQL 파일 4개를 직접 실행하여 생성한 실제 결과입니다. '
                  'SQLite Fiddle 캡처가 아니라 Python 표준 라이브러리의 SQLite 실행 결과이며, 빈 문자열은 JSON의 `""`로 표시합니다.\n')
    report.append(f'- 실행 시각: {datetime.now(timezone(timedelta(hours=9))).isoformat(timespec="seconds")} (KST)\n'
                  f'- Python: {sys.version.split()[0]}\n- SQLite: {sqlite3.sqlite_version}\n'
                  '- 실행 환경: 매 단계 새 메모리 DB, 자동 커밋, 외래 키 ON\n'
                  '- 실행 순서: 00 → 01 → 새 DB의 00 → 02 → 새 DB의 00 → 03\n')
    report.append('## 1. 준비: 제약조건과 초기 데이터\n')
    db = setup(record=True)
    report.append('검증 통과: 외래 키 활성화 값 1, 영화 6건, 찜 8건 및 모든 초기 값 일치.\n')

    report.append('## 2. 조건 조회·JOIN·집계\n')
    expected = [
        (['userId', 'memo'], [(r[1], r[3]) for r in INITIAL if r[2] == 101]),
        (['memo'], [('가족과 볼 영화',)]),
        (['movieId', 'memo'], [(103, '다시 보고 싶은 영화')]),
        (['movieId', 'memo'], [(103, '다시 보고 싶은 영화'), (101, 'OST가 좋은 영화')]),
        (['userId', 'title', 'memo'], [('user-a', '인터스텔라', ''), ('user-b', '어벤져스', '')]),
        (['emptyMemoCount'], [(2,)]),
        (['userId', 'emptyMemoCount'], [('user-a', 1), ('user-b', 1)]),
    ]
    sqls = list(statements('01-queries.sql'))
    check(len(sqls) == len(expected), '조회 SQL 문장 수 불일치')
    actuals = []
    for number, sql, exp in zip([5, 6, 7, 8, 14, 15, 16], sqls, expected):
        report.append(f'### TODO {number:02d}\n')
        actual = run(db, sql)
        actuals.append(actual)
        columns, rows = actual
        check(columns == exp[0], f'TODO {number}: 결과 열 불일치')
        check((sorted(rows) == sorted(exp[1])) if number == 5 else rows == exp[1], f'TODO {number}: 결과 행 불일치')
        check(favorites(db) == INITIAL, f'TODO {number}: 조회 중 원본 변경')
    check(actuals[5][1][0][0] == sum(row[1] for row in actuals[6][1]), '빈 메모 전체/사용자별 합계 불일치')
    report.append('검증 통과: LIMIT 조회는 1건, LIMIT 제외는 103 → 101이며 초기 8건은 그대로입니다. '
                  '전체 빈 메모 2건 = user-a 1건 + user-b 1건, user-c는 집계 결과에 없습니다.\n')
    db.close()

    report.append('## 3. CRUD: 새 메모리 DB에서 00-setup.sql을 다시 실행한 뒤 진행\n')
    db = setup()
    sqls = list(statements('02-crud.sql'))
    check(len(sqls) == 10, 'CRUD SQL 문장 수 변경: 검증 코드 확인 필요')
    added = (30, 'user-b', 106, '')
    updated = (30, 'user-b', 106, '주말에 다시 보기')
    expected_reads = {1: (COLS, [added]), 2: (['favoriteCount'], [(9,)]),
                      3: (COLS, [added]), 5: (COLS, [updated]), 6: (COLS, [updated]),
                      8: (COLS, []), 9: (COLS, INITIAL)}
    for index, sql in enumerate(sqls):
        actual = run(db, sql)
        if index in expected_reads:
            check(actual == expected_reads[index], f'CRUD {index + 1}: 조회 결과 불일치')
        check([r for r in favorites(db) if r[0] <= 8] == INITIAL, 'CRUD가 초기 8건을 변경함')
        expected_state = INITIAL + ([added] if index < 4 else [updated] if index < 7 else [])
        check(favorites(db) == expected_state, f'CRUD {index + 1}: 전체 상태 불일치')
    report.append('검증 통과: memo 생략 INSERT는 빈 문자열/전체 9건, UPDATE는 id 30의 memo만 변경, '
                  'DELETE는 id 30만 제거/전체 8건입니다. 모든 단계에서 초기 8건과 메모를 전부 비교해 보존을 확인했습니다.\n')
    db.close()

    report.append('## 4. 제약조건: 새 메모리 DB에서 00-setup.sql을 다시 실행한 뒤 진행\n')
    db = setup()
    sqls = list(statements('03-constraints.sql'))
    check(len(sqls) == 9, '제약 SQL 문장 수 변경: 검증 코드 확인 필요')
    errors = {0: 'UNIQUE constraint failed: favorites.userId, favorites.movieId',
              2: 'FOREIGN KEY constraint failed', 3: 'FOREIGN KEY constraint failed'}
    reasons = {
        0: 'A 실패 이유: id는 40으로 달라도 (user-a, 101)이 기존 id 1의 조합과 같아 복합 UNIQUE를 위반합니다.',
        1: 'B 성공 이유: (user-b, 106)은 기존에 없고 영화 106은 존재합니다. 사용자마다 같은 영화를 찜할 수 있습니다.',
        2: 'C 실패 이유: movies.id에 999가 없어 외래 키를 위반합니다.',
        3: 'D 실패 이유: 영화 106은 초기 id 8과 테스트 id 41의 찜이 참조하므로 기본 NO ACTION 외래 키 동작이 삭제를 막습니다.',
    }
    after_b = INITIAL + [(41, 'user-b', 106, '')]
    expected_reads = {4: (COLS, after_b), 5: (['favoriteCount'], [(9,)]),
                      6: (['id', 'title'], [(106, '어벤져스: 엔드게임')]), 8: (COLS, INITIAL)}
    for index, sql in enumerate(sqls):
        if index < 4:
            report.append(f'### 테스트 {chr(65 + index)}\n')
        elif index == 4:
            report.append('### D 직후 상태\n')
        elif index == 7:
            report.append('### 테스트 데이터 정리\n')
        actual = run(db, sql, expected_error=errors.get(index))
        if index in reasons:
            report.append(reasons[index] + '\n')
        if index in expected_reads:
            check(actual == expected_reads[index], f'제약 {index + 1}: 조회 결과 불일치')
        check(favorites(db) == (INITIAL if index == 0 or index >= 7 else after_b), f'제약 {index + 1}: 전체 찜 상태 불일치')
        check(db.execute('SELECT * FROM movies ORDER BY id').fetchall() == MOVIES, '제약 검증에서 영화 데이터 변경됨')
    check(db.execute('PRAGMA foreign_key_check').fetchall() == [], '외래 키 불일치 발견')
    report.append('검증 통과: A/C/D는 실제 제약조건 오류, B는 성공. D 직후 찜 9건과 영화 106 유지. '
                  'id 41 정리 후 초기 찜 8건과 영화 6건 모두 보존. `PRAGMA foreign_key_check`는 0행입니다.\n')
    db.close()
    report.append('## 5. 검증 대상 파일 SHA-256\n')
    for filename in ['00-setup.sql', '01-queries.sql', '02-crud.sql', '03-constraints.sql']:
        digest = hashlib.sha256((ROOT / 'sql' / filename).read_bytes()).hexdigest()
        report.append(f'- `{filename}`: `{digest}`')
    report.append(f'\n**PASS — {checks}개 검증 조건 통과.**\n')
    output = ROOT / 'results' / 'SQL결과_작성양식.md'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text('\n'.join(report), encoding='utf-8')
    print(f'PASS: {checks} checks; SQLite {sqlite3.sqlite_version}; report: {output}')


if __name__ == '__main__':
    main()
