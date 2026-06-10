# Tech — 기술 스택 (실측 기반)

> 출처: `go.mod`, `frontend/package.json`, `.golangci.yml`, `Makefile`. 버전은 변경될 수 있으니
> 의심되면 해당 파일에서 재확인할 것. **추측 금지.**

## Backend (Go)
- **Go 1.25.7** (`go.mod` 의 `go` 지시자 기준)
- 모듈: `github.com/SigNoz/signoz`
- 로깅: **`log/slog`** (표준). `go.uber.org/zap` **금지**.
- 에러: **`github.com/SigNoz/signoz/pkg/errors`**. 표준 `errors`, `fmt.Errorf` **금지**.
- 린터: `golangci-lint` v2 (`.golangci.yml`) — errcheck, govet, staticcheck, sloglint, forbidigo 등.
- 의존성 주입/구성: `pkg/factory`, `pkg/config` 패턴.

## Frontend (React / TypeScript)
- **React 18.2**, **TypeScript 5.9.3**
- 런타임: **Node ≥ 22**, 패키지 매니저 **pnpm 10.x** (npm/yarn 금지 — `only-allow pnpm`)
- 빌드: **Vite** (`rolldown-vite@7.3.1`)
- 상태: Redux + redux-thunk (레거시), Zustand 5 (신규), react-query 3 (서버 상태)
- UI: Ant Design 5 + `@signozhq/ui` 디자인 시스템
- API 클라이언트: **orval** 로 OpenAPI → `src/api/generated` 자동 생성 (react-query 훅)
- 차트: uPlot, Chart.js, visx
- 국제화: i18next

## Database / Storage
- **ClickHouse**: 로그·메트릭·트레이스 저장 (컬럼형, 고속 분석). 핵심 데이터 스토어.
- **Postgres / SQLite**: 메타스토어 (대시보드, 알림 규칙, 사용자 등 메타데이터). `pkg/sqlstore`, `pkg/sqlmigrator`.
- 마이그레이션: `pkg/sqlmigration`, `pkg/sqlschema`.

## 데이터 수집
- **OpenTelemetry Collector** (signoz-otel-collector) — devenv 에서 별도 실행.

## 테스트 도구
| 레이어 | 도구 | 명령 |
|--------|------|------|
| Go 단위 | go test | `make go-test` |
| FE 단위 | Jest 30 + Testing Library | `pnpm jest` |
| 통합/E2E | Python pytest (`tests/`) | `make py-test` |
| 브라우저 E2E | Playwright (`.claude/agents/`) | 에이전트 활용 |

## 빌드 / 실행 (Makefile)
- `make devenv-up` — ClickHouse + otel-collector 로컬 기동
- `make go-run-community` / `make go-run-enterprise` — 백엔드 실행
- `make go-build-community` / `make go-build-enterprise`
- `pnpm dev` (frontend/) — 프론트 개발 서버
- `make docker-buildx-community` / `-enterprise` — 도커 이미지

## 도구 선택 규칙
- 새 서버 상태 호출은 **react-query + orval 생성 훅** 사용. 수기 axios 호출 지양 (최근 커밋에서 deprecate).
- 새 Go 에러는 반드시 `pkg/errors`. 새 로그는 `slog` + snake_case 키.

관련: [[backend-go]] · [[frontend-react]] · [[database]] · [[testing]]
