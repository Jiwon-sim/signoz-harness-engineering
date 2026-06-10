# Test Strategy — 테스트 전략 (상세)

`.claude/steering/testing.md`(AI 규칙)의 사람용 확장판. **왜·어떻게** 를 설명한다.

## 테스트 피라미드 (SigNoz 매핑)
```
        ┌─────────────────┐
        │  E2E (적게)      │  Playwright(브라우저), pytest e2e — 느림·비쌈, 핵심 경로만
        ├─────────────────┤
        │ 통합 (중간)      │  pytest integration, Go 통합 — 모듈 간 계약 검증
        ├─────────────────┤
        │ 단위 (많이)      │  Go: go test / FE: Jest+RTL — 빠름·결정적, 기본
        └─────────────────┘
```
**원칙**: 아래로 갈수록 많이·빠르게. 위로 갈수록 적게·핵심만. flaky 테스트는 가치보다 비용이 크다.

## 레이어별 가이드

### Go 단위 테스트
- 위치: 소스 옆 `*_test.go`. 실행: `make go-test`.
- **테이블 드리븐** 권장:
  ```go
  tests := []struct{ name string; in X; want Y }{ ... }
  for _, tt := range tests {
      t.Run(tt.name, func(t *testing.T) { /* assert */ })
  }
  ```
- 목: mockery (`make gen-mocks`, `.mockery.yml`).
- 에러 경로도 테스트 (errcheck 정신). `pkg/errors` 타입/코드 검증.

### Frontend 단위 테스트 (Jest + Testing Library)
- 위치: `__tests__/`, `*.test.tsx`. 실행: `pnpm jest` (변경분: `pnpm test:changedsince`).
- **요소 선택은 `data-testid`** (role 의존 지양 — AGENTS.md).
- API 는 **MSW**(`msw`)로 목. 네트워크 실호출 금지.
- 시간·랜덤 고정 → 결정성.

### 통합 테스트 (pytest)
- 위치: `tests/integration/`. 셋업: `make py-test-setup` → 실행: `make py-test` → 정리: `make py-test-teardown`.
- 실제 백엔드 + DB 기동 상태에서 모듈 간 계약 검증.

### E2E
- **API E2E**: `tests/e2e/` (pytest).
- **브라우저 E2E**: Playwright. `.claude/agents/playwright-test-planner|generator|healer` 에이전트 활용.

## 요구사항 ↔ 테스트 추적 (하네스 핵심)
- 스펙의 **각 REQ 의 AC 는 최소 1개 TC 로 추적**된다.
- `/gen-tests <기능명>` 이 requirements 를 읽어 TC 표를 생성.
- TC 문서: `docs/harness/test-cases/<기능명>.md` (양식: [templates/test-case-template.md](./templates/test-case-template.md)).

| REQ | AC | TC | 레이어 | 자동화 |
|-----|----|----|--------|--------|
| REQ-1 | AC-1.1 | TC-1 | Go 단위 | ✅ |
| REQ-1 | AC-1.2 | TC-2 | FE Jest | ✅ |

## 무엇을 테스트할지 결정
- **회귀 위험 큰 경로 우선**: 쿼리 정확성, 알림 발화, 권한/격리, 마이그레이션.
- **동작 기반**: 구현 디테일이 아닌 관측 가능한 동작.
- **동작 변경 시**: 기존 테스트 단언을 먼저 갱신. 없으면 변경 **전에** 추가.

## 완료 정의 (DoD)
관련 단위 테스트 통과 + 린트/타입체크 통과 + 빌드 성공. **검증 실행 없이 완료 보고 금지.**

## 관련
- AI 규칙: `.claude/steering/testing.md`
- 워크플로우: [harness-workflow.md](./harness-workflow.md)
