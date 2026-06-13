# Tasks — LogsExplorer (로그 탐색기)

> design.md를 실행 작업으로 분해. 상태: 기존 구현 문서화 완료. 표기: [x] 완료 (기존 구현)

## TASK-1: 백엔드 로그 API (기존 구현 확인)
- **충족**: REQ-1, REQ-6, REQ-7, REQ-8, REQ-9
- **대상 파일**:
  - `pkg/query-service/app/http_handler.go` (RegisterLogsRoutes, getLogs, logFields, logFieldUpdate, logAggregate)
  - `pkg/query-service/app/logs/v3/`, `v4/` (쿼리 빌더)
  - `pkg/query-service/interfaces/interface.go` (Reader 인터페이스 로그 메서드)
  - `pkg/query-service/app/clickhouseReader/reader.go` (GetLogFields, UpdateLogField 구현)
- **세부**:
  - [x] 1.1 `GET /api/v1/logs/fields` — `logFields` 핸들러, `GetLogFields` Reader 메서드
  - [x] 1.2 `POST /api/v1/logs/fields` — `logFieldUpdate` 핸들러, 유효성 검사 + `UpdateLogField`
  - [x] 1.3 `GET /api/v1/logs/aggregate` — `logAggregate` 핸들러
  - [x] 1.4 `GET /api/v1/logs/livetail` — `QueryRawStream` SSE 핸들러
  - [x] 1.5 파이프라인 CRUD — `CreateLogsPipeline`, `ListLogsPipelinesHandler`, `PreviewLogsPipelinesHandler`
- **검증 게이트**: `go build ./pkg/query-service/...` 통과

## TASK-2: 프론트엔드 LogsExplorer 페이지 (기존 구현 확인)
- **충족**: REQ-1, REQ-2, REQ-3, REQ-4, REQ-10
- **대상 파일**:
  - `frontend/src/pages/LogsExplorer/index.tsx` (페이지 진입점)
  - `frontend/src/pages/LogsExplorer/utils.tsx` (ExplorerViews enum, QuickFilters 설정)
  - `frontend/src/container/LogsExplorerViews/index.tsx` (뷰 라우팅)
  - `frontend/src/container/LogsExplorerList/index.tsx` (List 뷰)
  - `frontend/src/container/LogsExplorerChart/index.tsx` (Timeseries 뷰)
- **세부**:
  - [x] 2.1 QueryBuilder 연동 (`useQueryBuilder`) + Run Query
  - [x] 2.2 QuickFilters 사이드 패널 + localStorage 상태 유지
  - [x] 2.3 List / Timeseries / Table 뷰 전환 + URL `panelType` 동기화
  - [x] 2.4 쿼리 취소 (`handleCancelQuery`) + `QueryCancelledPlaceholder`
  - [x] 2.5 로딩/에러 상태 UI
- **검증 게이트**: `pnpm tsgo --noEmit` 통과

## TASK-3: Live Logs SSE (기존 구현 확인)
- **충족**: REQ-5
- **대상 파일**:
  - `frontend/src/container/LiveLogs/LiveLogsContainer/index.tsx`
  - `frontend/src/container/LiveLogs/LiveLogsList/index.tsx`
  - `frontend/src/providers/EventSource/` (SSE 컨텍스트)
- **세부**:
  - [x] 3.1 Go Live 버튼 → `showLiveLogs: true` → LiveLogs 컴포넌트 마운트
  - [x] 3.2 `/api/v1/logs/livetail` SSE 구독 + 신규 로그 수신
  - [x] 3.3 Exit Live → SSE 연결 종료 + 일반 모드 복귀
- **검증 게이트**: `pnpm tsgo --noEmit` 통과

## TASK-4: 테스트 커버리지 확인
- **충족**: REQ-1~10 전체
- **기존 테스트 파일**:
  - `frontend/src/pages/LogsExplorer/__tests__/LogsExplorer.test.tsx`
  - `frontend/src/container/LogsExplorerList/__tests__/LogsExplorerList.test.tsx`
  - `frontend/src/container/LogsExplorerViews/tests/LogsExplorerViews.test.tsx`
  - `frontend/src/container/LogsExplorerViews/tests/LogsExplorerPagination.test.tsx`
  - `frontend/src/container/LogExplorerQuerySection/LogExplorerQuerySection.test.tsx`
- **테스트 공백 (추가 필요)**:
  - [ ] 4.1 Live Logs SSE 연결/종료 동작
  - [ ] 4.2 쿼리 취소 후 상태 리셋
  - [ ] 4.3 뷰 전환 시 URL 파라미터 변경 검증
  - [ ] 4.4 백엔드 `logFieldUpdate` 유효성 검사 Go 단위 테스트
- **검증 게이트**: `pnpm jest src/pages/LogsExplorer` 통과

## Phase 계획
| Phase | 태스크 | 게이트 |
|-------|--------|--------|
| 1 | TASK-1 (백엔드) | go build ✅ |
| 2 | TASK-2 (FE 페이지) | tsgo ✅ |
| 3 | TASK-3 (Live Logs) | tsgo ✅ |
| 4 | TASK-4 (테스트) | jest ✅ |

## 완료 정의 (DoD) — 기존 구현 기준
- [x] REQ-1~9 백엔드 API 구현 확인
- [x] REQ-1~5, 10 프론트엔드 구현 확인
- [ ] 테스트 공백(4.1~4.4) 보완 시 완전한 DoD 달성
