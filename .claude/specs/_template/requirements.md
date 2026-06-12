# Requirements — <기능명>

> EARS(Easy Approach to Requirements Syntax) 형식. 작성법: `/create-spec` 커맨드의 "EARS 작성법" 절 참조.
> 상태: Draft | Reviewed | Approved   ·   작성일: YYYY-MM-DD   ·   에디션: Community | Enterprise

## 1. 개요 (Introduction)
<이 기능이 무엇이고 왜 필요한지 2~4문장. 어떤 사용자/페르소나의 어떤 문제를 푸는가.>

## 2. 용어 (Glossary)
- **<용어>**: <정의>

## 3. 요구사항 (EARS)
각 요구사항은 고유 ID 를 가지며, 후속 design·tasks·tests 에서 이 ID 로 참조한다.

### REQ-1: <한 줄 제목>
- **유형**: Ubiquitous | Event-driven | State-driven | Unwanted | Optional
- **명세**:
  - (Event)   WHEN <트리거> THE SYSTEM SHALL <응답>
  - (State)   WHILE <상태> THE SYSTEM SHALL <동작>
  - (Unwanted) IF <원치 않는 조건> THEN THE SYSTEM SHALL <대응>
  - (Ubiquitous) THE SYSTEM SHALL <항상 보장>
- **근거(Rationale)**: <왜 필요한가>
- **수용 기준(Acceptance Criteria)**:
  - [ ] AC-1.1: <검증 가능한 조건>
  - [ ] AC-1.2: ...

### REQ-2: ...

## 4. 비기능 요구사항 (Non-functional)
- 성능 / 보안 / 호환성(Postgres·SQLite, Community·EE) / 관측성 등.

## 5. 범위 밖 (Out of scope)
- <이번에 다루지 않는 것>

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §_ | TASK-_ | TC-_ |
