# Design — LogsExplorer (로그 탐색기)

> requirements.md의 REQ-* 구현 설계. 상태: Approved · 작성일: 2026-06-13
> 참고(실측): `frontend/src/pages/LogsExplorer/index.tsx`, `pkg/query-service/app/http_handler.go` (RegisterLogsRoutes), `pkg/query-service/interfaces/interface.go`

## 1. 개요
LogsExplorer는 프론트엔드 중심 기능으로, 백엔드는 기존 `/api/v1/logs/*` 라우트와
`/api/v3/query_range`(공용 쿼리 엔진)를 그대로 사용한다.
주요 설계 포인트는 QueryBuilder 상태와 URL 파라미터의 동기화,
3종 뷰 전환, SSE 기반 Live Logs 스트리밍이다.

## 2. 아키텍처
- 영향 레이어: [x] Frontend [x] Backend(pkg) [ ] EE [x] ClickHouse(읽기 전용)
- 배치:
  - `frontend/src/pages/LogsExplorer/` — 페이지 진입점, 뷰 전환 상태, AI Actions
  - `frontend/src/container/LogsExplorerViews/` — List/Timeseries/Table 라우팅
  - `frontend/src/container/LogsExplorerList/` — List 뷰 렌더링
  - `frontend/src/container/LogsExplorerChart/` — Timeseries 뷰 (차트)
  - `frontend/src/container/LogsExplorerTable/` — Table 뷰
  - `frontend/src/container/LiveLogs/` — SSE 스트리밍 뷰
  - `pkg/query-service/app/http_handler.go` — 백엔드 라우트 핸들러
  - `pkg/query-service/app/logs/` — 로그 쿼리 빌더 (v3, v4)

- 흐름:
```
/logs/logs-explorer 진입
   └ LogsExplorer (page)
       ├ QuickFilters (사이드 패널) → QueryBuilder 필터 주입
       ├ Toolbar (뷰 전환 / Run Query / Go Live)
       ├ LogExplorerQuerySection (QueryBuilder UI)
       └ LogsExplorerViews
           ├ List  → LogsExplorerList  → GET /api/v3/query_range
           ├ Timeseries → LogsExplorerChart → GET /api/v3/query_range
           ├ Table → LogsExplorerTable → GET /api/v3/query_range
           └ Live  → LiveLogs → GET /api/v1/logs/livetail (SSE)
```

## 3. 백엔드 API (REQ-1, 6, 7, 8, 9)

| 엔드포인트 | 메서드 | 핸들러 | 권한 |
|-----------|--------|--------|------|
| `/api/v3/query_range` | POST | QuerierHandler | ViewAccess |
| `/api/v1/logs` | GET | `getLogs` | ViewAccess |
| `/api/v1/logs/fields` | GET | `logFields` | ViewAccess |
| `/api/v1/logs/fields` | POST | `logFieldUpdate` | EditAccess |
| `/api/v1/logs/aggregate` | GET | `logAggregate` | ViewAccess |
| `/api/v1/logs/livetail` | GET | `QueryRawStream` (SSE) | ViewAccess |
| `/api/v1/logs/pipelines` | POST | `CreateLogsPipeline` | EditAccess |
| `/api/v1/logs/pipelines/{version}` | GET | `ListLogsPipelinesHandler` | ViewAccess |
| `/api/v1/logs/pipelines/preview` | POST | `PreviewLogsPipelinesHandler` | ViewAccess |

Reader 인터페이스 메서드:
- `GetLogFields(ctx)` → `*model.GetFieldsResponse`
- `UpdateLogField(ctx, field)` → `*model.ApiError`
- `GetLogAttributeKeys(ctx, req)` → 자동완성
- `GetLogAttributeValues(ctx, req)` → 자동완성
- `GetLogAggregateAttributes(ctx, req)` → 집계 속성
- `GetQBFilterSuggestionsForLogs(ctx, req)` → 필터 제안

## 4. 프론트엔드 설계 (REQ-1~5, 10)

### 상태 관리
- **QueryBuilder 상태**: `useQueryBuilder` 훅 — 전역 쿼리 상태 관리
- **뷰 상태**: `selectedView: ExplorerViews` (LIST / TIMESERIES / TABLE)
  - URL `panelType` 파라미터와 동기화 (`panelTypeToExplorerView` 매핑)
- **QuickFilters 표시**: localStorage (`LOCALSTORAGE.SHOW_LOGS_QUICK_FILTERS`)
- **로딩 상태**: `isLoadingQueries: boolean` — 차일드 컴포넌트에서 콜백으로 수신
- **취소 상태**: `isCancelled: boolean` — QueryCancelledPlaceholder 조건부 렌더

### 뷰 전환 로직 (REQ-3)
```typescript
// ExplorerViews enum (utils.tsx)
enum ExplorerViews { LIST='list', TIMESERIES='timeseries', TABLE='table' }

handleChangeSelectedView(view) {
  nextPanelType = explorerViewToPanelType[view]
  handleSetConfig(nextPanelType, DataSource.LOGS)  // QueryBuilder 설정
  setSelectedView(view)
  handleExplorerTabChange(nextPanelType)            // URL 동기화
}
```

### Live Logs (REQ-5)
- `showLiveLogs: boolean` 상태로 LiveLogs 컴포넌트 조건부 렌더
- SSE: `EventSourceProvider` 컨텍스트 내에서 `/api/v1/logs/livetail` 구독
- Live 모드 진입 시 Timeseries/Table 뷰 전환 버튼 비활성화

### QuickFilters (REQ-2)
- `LogsQuickFiltersConfig`: severity_text, deployment.environment, service.name, host.name, k8s.cluster/deployment/namespace/pod name
- 필터 선택 → QueryBuilder `WHERE` 조건 자동 추가

## 5. 데이터 모델

### 로그 필드 응답
```typescript
// GetFieldsResponse
{
  selected_fields: LogField[],
  interesting_fields: LogField[]
}
// LogField
{ name: string, dataType: string, type: string, isColumn: boolean }
```

### 로그 집계 응답
```go
// model.GetLogsAggregatesResponse
type GetLogsAggregatesResponse struct {
    Items []interface{} `json:"items"`
}
```

## 6. 에러 처리 · 엣지 케이스
- ClickHouse 연결 실패 → API 에러 → react-query `isError` → 에러 UI 표시 (REQ-10)
- 빈 결과 → 빈 상태 UI (REQ-1, AC-1.3)
- SSE 연결 끊김 → EventSourceProvider 재연결 또는 에러 표시 (REQ-5)
- 잘못된 필드명 POST → 백엔드 400 반환 (REQ-7, AC-7.1)

## 7. 테스트 전략
| REQ | 레이어 | 검증 방법 |
|-----|--------|-----------|
| REQ-1 | FE Jest | MSW로 query_range 목킹 → 로그 행 렌더 확인 |
| REQ-2 | FE Jest | QuickFilters 클릭 → QueryBuilder 필터 상태 변경 확인 |
| REQ-3 | FE Jest | 뷰 전환 버튼 클릭 → 컴포넌트 교체 + URL 파라미터 확인 |
| REQ-4 | FE Jest | Cancel 클릭 → QueryCancelledPlaceholder 렌더 확인 |
| REQ-5 | FE Jest | Go Live 클릭 → LiveLogs 컴포넌트 마운트 확인 |
| REQ-6 | Go 단위 | logFields 핸들러 → GetLogFields 호출 + 응답 형식 |
| REQ-7 | Go 단위 | logFieldUpdate 핸들러 → 유효성 검사 + UpdateLogField 호출 |
| REQ-8 | Go 단위 | logAggregate 핸들러 → 응답 형식 |
| REQ-9 | Go 단위 | pipelines 핸들러 → CRUD 동작 |
| REQ-10 | FE Jest | isLoading/isError 상태별 UI 렌더 확인 |

## 8. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|--------------|
| §3 (백엔드 API) | REQ-1, REQ-6, REQ-7, REQ-8, REQ-9 |
| §4 (FE 상태·뷰) | REQ-1, REQ-2, REQ-3, REQ-4, REQ-10 |
| §4 (Live Logs) | REQ-5 |
