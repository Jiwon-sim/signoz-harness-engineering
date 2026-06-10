# Testing — 테스트 전략

## 테스트 피라미드 (SigNoz 매핑)
```
        ┌─────────────┐
        │  E2E (적게) │  Playwright (브라우저) · pytest e2e
        ├─────────────┤
        │ 통합 (중간) │  pytest integration (tests/integration) · Go 통합
        ├─────────────┤
        │ 단위 (많이) │  Go: go test  ·  FE: Jest + Testing Library
        └─────────────┘
```

## 레이어별 도구 · 명령
| 레이어 | 위치 | 실행 |
|--------|------|------|
| Go 단위 | `*_test.go` | `make go-test` |
| FE 단위 | `__tests__/`, `*.test.tsx` | `pnpm jest` (변경분만: `pnpm test:changedsince`) |
| 통합 | `tests/integration/` (pytest) | `make py-test-setup && make py-test` |
| E2E API | `tests/e2e/` (pytest) | `make py-test` |
| 브라우저 E2E | Playwright | `.claude/agents/playwright-test-*` 에이전트 |

## 테스트 작성 원칙
- **단위 우선**: 새 로직은 단위 테스트로 덮는다. Go 는 테이블 드리븐.
- **행위 기반**: 구현 디테일이 아닌 관측 가능한 동작을 검증.
- **FE**: `data-testid` 로 요소 선택 (role 의존 지양). MSW(`msw`)로 API 목.
- **결정성**: 시간·랜덤·네트워크는 목/고정. flaky 테스트 금지.

## 기능별 테스트 케이스 (하네스 핵심 산출물)
- 스펙의 각 요구사항(EARS)은 **최소 1개의 테스트 케이스**로 추적된다.
- 테스트 케이스는 `docs/harness/templates/test-case-template.md` 양식을 따른다.
- `/gen-tests <기능명>` 커맨드가 스펙 → 테스트 케이스 초안을 생성한다.

## 커버리지 기준 (가이드)
- 신규/변경 로직은 핵심 분기를 덮는다. 회귀 위험이 큰 경로 우선.
- 동작을 바꾸면 기존 테스트 단언을 먼저 갱신한다 (없으면 변경 전 추가).

## 완료 정의 (Definition of Done)
기능이 "완료"되려면: 관련 단위 테스트 통과 + 린트/타입체크 통과 + 빌드 성공.
검증을 실제로 실행하지 않고 완료 보고 금지. ([[harness-principles]])

관련: [[backend-go]] · [[frontend-react]] · [[harness-principles]]
