---
description: 기능 스펙(requirements→design→tasks)을 EARS 형식으로 생성
argument-hint: <기능명>
---

# /create-spec — 기능 스펙 생성

대상 기능: **$ARGUMENTS**

너는 SigNoz 하네스의 spec-first 워크플로우를 수행한다. 아래 순서를 **단계별로 사용자 승인**을 받으며 진행한다.
참고 규칙: `.claude/steering/harness-principles.md`, `docs/harness/requirements-guide.md`.

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
