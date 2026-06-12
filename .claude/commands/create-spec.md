---
description: 기능 스펙(requirements→design→tasks)을 EARS 형식으로 생성
argument-hint: <기능명>
---

# /create-spec — 기능 스펙 생성

대상 기능: **$ARGUMENTS**

너는 SigNoz 하네스의 spec-first 워크플로우를 수행한다. 아래 순서를 **단계별로 사용자 승인**을 받으며 진행한다.
하네스 원칙은 `CLAUDE.md` 참조. 요구사항은 이 문서 하단의 **"EARS 요구사항 작성법"** 을 따른다.

## 절차

1. **사전 조사 (사실 수집)**
   - `$ARGUMENTS` 와 관련된 기존 코드를 탐색한다 (Grep/Glob). 도메인 모듈 위치, 관련 API, 기존 테스트 확인.
   - 에디션(Community `pkg/` vs Enterprise `ee/`)을 판별한다.
   - 추측 금지 — 실제 파일에서 확인한 사실만 사용한다.

2. **requirements.md 작성**
   - `.claude/specs/$ARGUMENTS/requirements.md` 생성 (템플릿: `.claude/specs/_template/requirements.md`).
   - 요구사항은 **EARS 형식**, 각 REQ 에 고유 ID + 수용 기준(AC).
   - 작성 후 사용자에게 검토 요청 → **승인 전 다음 단계로 넘어가지 않는다.**

3. **design.md 작성** (requirements 승인 후)
   - 템플릿 기반. 아키텍처·데이터 모델·API·테스트 전략을 REQ ID 로 추적.
   - steering 규칙(에러=pkg/errors, 로깅=slog, 컴포넌트 규칙) 반영.
   - 사용자 검토 요청.

4. **tasks.md 작성** (design 승인 후)
   - 실행 가능한 TASK 로 분해. 각 태스크 5파일 이하, 검증 게이트 명시.
   - 각 TASK 를 REQ ID 와 연결, 테스트 케이스 자리(TC-) 표시.

## 출력 규칙
- 디렉토리: `.claude/specs/$ARGUMENTS/`
- 추적표(requirements ↔ design ↔ tasks)를 항상 채운다.
- 마지막에 다음 액션 안내: 구현 시작 또는 `/gen-tests $ARGUMENTS`.

---

## EARS 요구사항 작성법

모든 요구사항은 **EARS(Easy Approach to Requirements Syntax)** 로 쓴다. 모호한 문장 대신
**검증 가능한 단정문**을 만들어, 각 요구사항이 곧바로 테스트 케이스가 되게 한다.

### 5가지 패턴
| 유형 | 템플릿 | 예시 |
|------|--------|------|
| **Ubiquitous** (항상) | THE SYSTEM SHALL `<동작>` | THE SYSTEM SHALL 모든 알림 규칙을 조직 단위로 격리한다 |
| **Event-driven** (이벤트) | WHEN `<트리거>` THE SYSTEM SHALL `<응답>` | WHEN 사용자가 트레이스 ID 를 클릭하면 THE SYSTEM SHALL 트레이스 상세를 연다 |
| **State-driven** (상태) | WHILE `<상태>` THE SYSTEM SHALL `<동작>` | WHILE 쿼리가 실행 중이면 THE SYSTEM SHALL 로딩 표시를 유지한다 |
| **Unwanted** (원치 않음) | IF `<조건>` THEN THE SYSTEM SHALL `<대응>` | IF ClickHouse 응답이 비면 THEN THE SYSTEM SHALL 빈 상태 UI 를 표시한다 |
| **Optional** (선택 기능) | WHERE `<기능 활성>` THE SYSTEM SHALL `<동작>` | WHERE 이상탐지가 켜져 있으면 THE SYSTEM SHALL 베이스라인을 계산한다 |

### 작성 규칙
1. **하나의 요구사항 = 하나의 검증 가능한 동작.** 접속사로 여러 동작을 묶지 말 것.
2. **측정 가능하게.** "빠르게" ✕ → "p95 < 500ms" ○.
3. **고유 ID 부여.** `REQ-1`, `REQ-2` … design·tasks·tests 가 이 ID 로 참조.
4. **수용 기준(AC) 명시.** 각 REQ 아래 `AC-1.1`, `AC-1.2` … 체크 가능한 조건.
5. **에디션·호환성 표기.** Community/EE, Postgres/SQLite 차이가 있으면 명시.

### 작성 후 체크리스트
- [ ] 모든 REQ 에 고유 ID + 1개 이상 AC 가 있다.
- [ ] 모든 REQ 가 5가지 패턴 중 하나로 표현됐다.
- [ ] 각 AC 는 자동/수동 테스트로 검증 가능하다.
- [ ] 비기능 요구사항(성능·보안·호환성)을 별도 절에 분리했다.
- [ ] 추적표가 채워졌다 (REQ ↔ design ↔ tasks ↔ tests).
