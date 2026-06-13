# Tasks — TracesExplorer (트레이스 탐색기)

> design.md를 실행 작업으로 분해. 상태: 기존 구현 문서화 완료.

## TASK-1: 백엔드 트레이스 API (기존 구현 확인)
- **충족**: REQ-1, REQ-4, REQ-5, REQ-6
- **대상 파일**:
  - `pkg/query-service/app/http_handler.go` (SearchTraces, GetFlamegraphSpansForTrace, traceFields, updateTraceField)
  - `pkg/query-service/app/clickhouseReader/reader.go` (트레이스 조회 구현)
  - `pkg/query-service/interfaces/interface.go` (트레이스 Reader 메서드)
- **세부**:
  - [x] 1.1 `GET /api/v1/traces/{traceId}` — `SearchTraces` 핸들러
  - [x] 1.2 `POST /api/v2/traces/flamegraph/{traceId}` — `GetFlamegraphSpansForTrace`
  - [x] 1.3 `GET /api/v2/traces/fields` — `traceFields` 핸들러
  - [x] 1.4 `POST /api/v2/traces/fields` — `updateTraceField` 핸들러
- **검증 게이트**: `go build ./pkg/query-service/...`

## TASK-2: 프론트엔드 TracesExplorer 페이지 (기존 구현 확인)
- **충족**: REQ-1, REQ-2, REQ-3, REQ-7, REQ-8, REQ-9
- **대상 파일**:
  - `frontend/src/pages/TracesExplorer/index.tsx`
  - `frontend/src/container/TracesExplorer/ListView/`
  - `frontend/src/container/TracesExplorer/TracesView/`
  - `frontend/src/container/TracesExplorer/TableView/`
  - `frontend/src/container/PaginatedTraceFlamegraph/`
- **세부**:
  - [x] 2.1 List / Timeseries / Table 뷰 전환 + URL 동기화
  - [x] 2.2 QuickFilters → QueryBuilder 연동
  - [x] 2.3 Export to Dashboard (`getExportQueryData`, `generateExportToDashboardLink`)
  - [x] 2.4 쿼리 취소 + `QueryCancelledPlaceholder`
  - [x] 2.5 플레임그래프 (`PaginatedTraceFlamegraph`)
- **검증 게이트**: `pnpm tsgo --noEmit`

## TASK-3: 테스트 커버리지 확인
- **기존 테스트**: `frontend/src/pages/TracesExplorer/__test__/`
- **테스트 공백 (추가 필요)**:
  - [ ] 3.1 플레임그래프 스팬 렌더링 단위 테스트
  - [ ] 3.2 Export to Dashboard 링크 생성 단위 테스트
  - [ ] 3.3 백엔드 `SearchTraces` Go 단위 테스트
- **검증 게이트**: `pnpm jest src/pages/TracesExplorer`

## 완료 정의 (DoD)
- [x] REQ-1~9 구현 확인
- [ ] 테스트 공백(3.1~3.3) 보완 시 완전한 DoD 달성
