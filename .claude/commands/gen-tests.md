---
description: 스펙(요구사항)을 기반으로 기능별 테스트 케이스를 생성·실행
argument-hint: <기능명>
---

# /gen-tests — 기능별 테스트 케이스 생성

대상 기능: **$ARGUMENTS**

너는 `.claude/specs/$ARGUMENTS/` 의 요구사항(EARS)을 **테스트 케이스로 변환**한다.
각 REQ 의 수용 기준(AC)은 최소 1개의 테스트로 추적되어야 한다.
참고: `.claude/steering/testing.md`, `.claude/specs/_template/test-case-template.md`.

## 절차

1. **스펙 로드**
   - `.claude/specs/$ARGUMENTS/requirements.md` 와 `design.md` 를 읽는다.
   - 스펙이 없으면 먼저 `/create-spec $ARGUMENTS` 를 안내한다.

2. **레이어 결정**
   - 각 REQ 를 어떤 레이어 테스트로 덮을지 정한다:
     - Go 단위 → `*_test.go` (`make go-test`)
     - FE 단위 → Jest + Testing Library (`pnpm jest`), `data-testid` 사용
     - 통합/E2E → pytest (`tests/`) 또는 Playwright 에이전트

3. **테스트 케이스 문서화**
   - `.claude/specs/$ARGUMENTS/test-cases.md` 에 테스트 케이스 표를 작성한다 (템플릿: `.claude/specs/_template/test-case-template.md`).
   - 각 TC: ID, 대상 REQ/AC, 전제조건, 입력, 기대결과, 레이어, 자동화 여부.

4. **테스트 코드 초안 (선택)**
   - 사용자 승인 시, 해당 레이어 컨벤션에 맞는 테스트 코드 스켈레톤을 생성한다.
   - Go: 테이블 드리븐. FE: testid 기반. 결정성 보장(시간/랜덤/네트워크 목).

5. **실행·검증**
   - 생성한 테스트를 실제로 실행하고 결과를 보고한다.
   - 실패하면 실패 출력과 함께 보고 (검증 필수 원칙).

## 출력
- 테스트 케이스 문서 + (승인 시) 테스트 코드.
- requirements.md 의 추적표에 TC-ID 를 역으로 채운다.
