# Design — TracesExplorer (트레이스 탐색기)

> requirements.md의 REQ-* 구현 설계. 상태: Approved · 작성일: 2026-06-13
> 참고(실측): `frontend/src/pages/TracesExplorer/index.tsx`, `pkg/query-service/app/http_handler.go`

## 1. 개요
TracesExplorer는 LogsExplorer와 동일한 QueryBuilder + 뷰 전환 패턴을 공유하며,
트레이스 특화 기능(플레임그래프, 트레이스 상세, Export to Dashboard)이 추가된 구조다.
백엔드는 공용 `/api/v3/query_range` + 트레이스 전용 `/api/v1|v2/traces/*` 엔드포인트를 사용한다.

## 2. 아키텍처
- 영향 레이어: [x] Frontend [x] Backend(pkg) [ ] EE [x] ClickHouse(읽기 전용)
- 배치:
  - `frontend/src/pages/TracesExplorer/` — 페이지 진입점
  - `frontend/src/container/TracesExplorer/ListView/` — List 뷰
  - `frontend/src/container/TracesExplorer/TracesView/` — Timeseries 뷰
  - `frontend/src/container/TracesExplorer/TableView/` — Table 뷰
  - `frontend/src/container/PaginatedTraceFlamegraph/` — 플레임그래프
  - `pkg/query-service/app/http_handler.go` — 트레이스 라우트 핸들러

- 흐름:
```
/traces/traces-explorer 진입
   └ TracesExplorer (page)
       ├ QuickFilters → QueryBuilder 필터 주입
       ├ Toolbar (뷰 전환 / Run Query / Export)
       ├ QuerySection (QueryBuilder UI)
       └ 뷰 전환
           ├ List     → ListView       → POST /api/v3/query_range
           ├ Timeseries → TracesView   → POST /api/v3/query_range
           └ Table    → TableView      → POST /api/v3/query_range
트레이스 클릭
   └ /trace/{traceId} → GET /api/v1/traces/{traceId}
       └ PaginatedTraceFlamegraph → POST /api/v2/traces/flamegraph/{traceId}
```

## 3. 백엔드 API (REQ-1, 4, 5, 6)

| 엔드포인트 | 메서드 | 핸들러 | 권한 |
|-----------|--------|--------|------|
| `/api/v3/query_range` | POST | `QueryRangeV3` | ViewAccess |
| `/api/v1/traces/{traceId}` | GET | `SearchTraces` | ViewAccess |
| `/api/v2/traces/flamegraph/{traceId}` | POST | `GetFlamegraphSpansForTrace` | ViewAccess |
| `/api/v2/traces/fields` | GET | `traceFields` | ViewAccess |
| `/api/v2/traces/fields` | POST | `updateTraceField` | EditAccess |

## 4. 프론트엔드 설계 (REQ-1~3, 7~9)

### 상태 관리
- **QueryBuilder 상태**: `useQueryBuilder` 훅 (LogsExplorer와 동일 패턴)
- **뷰 상태**: `ExplorerViews` enum (LogsExplorer utils 공유) + URL `panelType`
- **Export**: `getExportQueryData()`, `generateExportToDashboardLink()` 유틸 사용
- **컬럼 설정**: `useOptionsMenu` 훅으로 표시 컬럼 커스터마이징 (`defaultSelectedColumns`)

### 뷰별 컴포넌트
| 뷰 | 컴포넌트 | 데이터 소스 |
|----|---------|-----------|
| List | `container/TracesExplorer/ListView` | `/api/v3/query_range` (LIST 타입) |
| Timeseries | `container/TracesExplorer/TracesView` | `/api/v3/query_range` (TIME_SERIES) |
| Table | `container/TracesExplorer/TableView` | `/api/v3/query_range` (TABLE) |

### 플레임그래프 (REQ-5)
- `PaginatedTraceFlamegraph`: 대용량 트레이스를 페이지 단위로 로드
- `TraceFlamegraphStates`: 로딩/에러/빈 상태 처리

### Export to Dashboard (REQ-7)
```typescript
// 현재 query → Dashboard 패널 형식 변환
getExportQueryData(currentQuery, panelType)
generateExportToDashboardLink(dashboardId, panelData)
```

## 5. 데이터 모델

### 트레이스 응답
```typescript
// GET /api/v1/traces/{traceId}
interface SpanItem {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  operationName: string;
  serviceName: string;
  startTime: number;
  durationNano: number;
  statusCode: number;
  tags: Record<string, string>;
}
```

## 6. 에러 처리 · 엣지 케이스
- 존재하지 않는 traceId → 404 → 에러 UI 표시 (REQ-9)
- 수천 개 스팬의 대용량 트레이스 → PaginatedTraceFlamegraph로 분할 로드 (REQ-5)
- 쿼리 취소 → `QueryCancelledPlaceholder` (REQ-8)

## 7. 테스트 전략
| REQ | 레이어 | 검증 방법 |
|-----|--------|-----------|
| REQ-1 | FE Jest | MSW mock → 트레이스 행 렌더 확인 |
| REQ-3 | FE Jest | 뷰 전환 클릭 → 컴포넌트 교체 + URL 확인 |
| REQ-4 | Go 단위 | SearchTraces 핸들러 → traceId 조회 응답 |
| REQ-5 | FE Jest | 플레임그래프 마운트 + 스팬 렌더 확인 |
| REQ-8 | FE Jest | Cancel 클릭 → QueryCancelledPlaceholder |

## 8. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|--------------|
| §3 (백엔드 API) | REQ-1, REQ-4, REQ-5, REQ-6 |
| §4 (FE 뷰·상태) | REQ-1, REQ-2, REQ-3, REQ-7, REQ-8, REQ-9 |
