# Requirements Guide — EARS 형식 요구사항 작성법

하네스의 모든 기능 스펙은 **EARS(Easy Approach to Requirements Syntax)** 로 요구사항을 쓴다.
모호한 문장 대신 **검증 가능한 단정문**을 만들기 위함이다.

## 왜 EARS 인가
- 자연어 요구사항은 모호("빨라야 한다")해서 테스트로 옮기기 어렵다.
- EARS 는 트리거·조건·시스템 응답을 구조화 → **각 요구사항이 곧 테스트 케이스**가 된다.

## 5가지 패턴
| 유형 | 템플릿 | 예시 |
|------|--------|------|
| **Ubiquitous** (항상) | THE SYSTEM SHALL `<동작>` | THE SYSTEM SHALL 모든 알림 규칙을 조직 단위로 격리한다 |
| **Event-driven** (이벤트) | WHEN `<트리거>` THE SYSTEM SHALL `<응답>` | WHEN 사용자가 트레이스 ID 를 클릭하면 THE SYSTEM SHALL 트레이스 상세를 연다 |
| **State-driven** (상태) | WHILE `<상태>` THE SYSTEM SHALL `<동작>` | WHILE 쿼리가 실행 중이면 THE SYSTEM SHALL 로딩 표시를 유지한다 |
| **Unwanted** (원치 않음) | IF `<조건>` THEN THE SYSTEM SHALL `<대응>` | IF ClickHouse 응답이 비면 THEN THE SYSTEM SHALL 빈 상태 UI 를 표시한다 |
| **Optional** (선택 기능) | WHERE `<기능 활성>` THE SYSTEM SHALL `<동작>` | WHERE 이상탐지가 켜져 있으면 THE SYSTEM SHALL 베이스라인을 계산한다 |

## 작성 규칙
1. **하나의 요구사항 = 하나의 검증 가능한 동작.** 접속사로 여러 동작을 묶지 말 것.
2. **측정 가능하게.** "빠르게" ✕ → "p95 < 500ms" ○.
3. **고유 ID 부여.** `REQ-1`, `REQ-2`. design·tasks·tests 가 이 ID 로 참조.
4. **수용 기준(AC) 명시.** 각 REQ 아래 `AC-1.1`, `AC-1.2` … 체크 가능한 조건.
5. **에디션·호환성 표기.** Community/EE, Postgres/SQLite 차이가 있으면 명시.

## 좋은 예 vs 나쁜 예
```
✕ 나쁨: "대시보드는 사용하기 편해야 한다."
   → 모호, 테스트 불가.

○ 좋음:
REQ-3: 대시보드 패널 복제
  유형: Event-driven
  WHEN 사용자가 패널의 'Duplicate' 를 클릭하면
  THE SYSTEM SHALL 동일 설정의 새 패널을 같은 대시보드에 추가한다.
  AC-3.1: 복제 패널의 쿼리·시각화 타입이 원본과 동일하다.
  AC-3.2: 복제 패널 제목은 "<원본> (copy)" 이다.
  AC-3.3: 원본 패널은 변경되지 않는다.
```

## 작성 후 체크리스트
- [ ] 모든 REQ 에 고유 ID 가 있다.
- [ ] 모든 REQ 가 5가지 패턴 중 하나로 표현됐다.
- [ ] 각 REQ 에 1개 이상 AC 가 있다.
- [ ] 각 AC 는 자동/수동 테스트로 검증 가능하다.
- [ ] 비기능 요구사항(성능·보안·호환성)을 §4 에 분리했다.
- [ ] 추적표가 채워졌다 (REQ ↔ design ↔ tasks ↔ tests).

## 템플릿
`.claude/specs/_template/requirements.md` 를 복사해 시작한다. `/create-spec <기능명>` 이 자동 생성한다.

## 관련
- 워크플로우: [harness-workflow.md](./harness-workflow.md)
- 테스트 추적: [test-strategy.md](./test-strategy.md)
