# Test Cases — 기능별 테스트 케이스 인덱스

> [feature-catalog.md](../feature-catalog.md)의 기능 영역에 대한 테스트 케이스 모음.
> 양식: [../templates/test-case-template.md](../templates/test-case-template.md).
> 이 단계의 TC 는 **사용자 관찰 가능 동작(블랙박스) 기준**이다. 세부 내부 동작은 구현/스펙 단계에서 `/analyze-feature`로 확정한다. ([[harness-principles]])

## 작성 상태 (전체 21개 영역)
| 기능 영역 | TC 문서 | 상태 |
|-----------|---------|------|
| APM / Services | [apm-services.md](./apm-services.md) | ✅ 작성됨 |
| Logs Explorer | [logs-explorer.md](./logs-explorer.md) | ✅ 작성됨 |
| Alerts | [alerts.md](./alerts.md) | ✅ 작성됨 |
| Dashboards | [dashboards.md](./dashboards.md) | ✅ 작성됨 |
| Traces | — | ⬜ 예정 (동일 패턴) |
| Trace Funnels | — | ⬜ 예정 |
| Logs Pipelines | — | ⬜ 예정 |
| Metrics Explorer | — | ⬜ 예정 |
| Meter | — | ⬜ 예정 |
| Exceptions | — | ⬜ 예정 |
| Infra Monitoring | — | ⬜ 예정 |
| Messaging Queues | — | ⬜ 예정 |
| API Monitoring | — | ⬜ 예정 |
| Integrations / Cloud | — | ⬜ 예정 |
| AI Assistant | — | ⬜ 예정 |
| Onboarding / Home | — | ⬜ 예정 |
| Settings / Admin | — | ⬜ 예정 |
| Auth / Identity | — | ⬜ 예정 |
| Service Accounts | — | ⬜ 예정 |
| Workspace / Billing | — | ⬜ 예정 |

> 핵심 4개 영역을 표준 양식으로 먼저 작성했다. 나머지는 같은 구조로 확장하거나,
> 해당 기능을 실제로 작업할 때 `/gen-tests <기능>`로 정밀 생성한다.

## TC ID 규칙
`TC-<영역약어>-<번호>` — 예: `TC-APM-1`, `TC-LOG-3`, `TC-ALR-2`, `TC-DSH-4`.

## 레이어 표기
- **E2E**: Playwright (브라우저) — 사용자 플로우.
- **FE 단위**: Jest + Testing Library — 컴포넌트/훅.
- **통합**: pytest (`tests/integration`) — API↔DB.
- **Go 단위**: `*_test.go` — 백엔드 로직.
