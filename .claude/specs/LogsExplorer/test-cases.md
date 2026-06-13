# Test Cases — LogsExplorer (로그 탐색기)

> 출처 스펙: `.claude/specs/LogsExplorer/requirements.md`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-LE-1 | REQ-1 / AC-1.1, 1.2, 1.3 | FE Jest | ✅ | [ ] |
| TC-LE-2 | REQ-2 / AC-2.1, 2.2, 2.3 | FE Jest | ✅ | [ ] |
| TC-LE-3 | REQ-3 / AC-3.1, 3.2, 3.3, 3.4 | FE Jest | ✅ | [ ] |
| TC-LE-4 | REQ-4 / AC-4.1, 4.2, 4.3 | FE Jest | ✅ | [ ] |
| TC-LE-5 | REQ-5 / AC-5.1, 5.2, 5.3, 5.4 | FE Jest | ✅ | [ ] |
| TC-LE-6 | REQ-6 / AC-6.1, 6.2 | Go 단위 | ✅ | [ ] |
| TC-LE-7 | REQ-7 / AC-7.1, 7.2 | Go 단위 | ✅ | [ ] |
| TC-LE-8 | REQ-8 / AC-8.1, 8.2 | Go 단위 | ✅ | [ ] |
| TC-LE-9 | REQ-9 / AC-9.1, 9.2, 9.3 | Go 단위 | ✅ | [ ] |
| TC-LE-10 | REQ-10 / AC-10.1, 10.2, 10.3 | FE Jest | ✅ | [ ] |

## 테스트 케이스 상세

### TC-LE-1: 로그 목록 조회
- **추적**: REQ-1 (AC-1.1, 1.2, 1.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `/api/v3/query_range` 응답 목킹 (ERROR 레벨 로그 3건)
- **입력/동작 (When)**: severity=ERROR QuickFilter 적용 후 Run Query 클릭
- **기대 결과 (Then)**:
  - 로그 행 3건이 테이블에 렌더링됨 (AC-1.1)
  - timestamp 내림차순 정렬 확인 (AC-1.2)
- **엣지/부정 케이스**: 빈 응답 시 "No logs found" 빈 상태 UI 표시 (AC-1.3)
- **테스트 위치(예정)**: `frontend/src/pages/LogsExplorer/__tests__/LogsExplorer.test.tsx`
- **결정성 메모**: MSW로 API 응답 고정. 타임스탬프는 고정값 사용.

### TC-LE-2: QuickFilters 적용
- **추적**: REQ-2 (AC-2.1, 2.2, 2.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: LogsExplorer 페이지 마운트, QuickFilters 패널 표시 상태
- **입력/동작 (When)**: severity_text = "ERROR" 체크박스 선택
- **기대 결과 (Then)**:
  - QueryBuilder WHERE 조건에 `severity_text = "ERROR"` 추가됨 (AC-2.1)
- **엣지/부정 케이스**:
  - 패널 토글 후 localStorage 값 확인 (AC-2.2)
  - 패널 숨김 시 결과 영역 너비 확장 확인 (AC-2.3)
- **테스트 위치(예정)**: `frontend/src/pages/LogsExplorer/__tests__/LogsExplorer.test.tsx`
- **결정성 메모**: localStorage 목킹 사용.

### TC-LE-3: 뷰 전환
- **추적**: REQ-3 (AC-3.1, 3.2, 3.3, 3.4)
- **레이어**: FE Jest
- **전제조건 (Given)**: LogsExplorer 페이지 마운트, 기본 List 뷰 표시 중
- **입력/동작 (When)**: 툴바에서 "Timeseries" 버튼 클릭
- **기대 결과 (Then)**:
  - `LogsExplorerChart` 컴포넌트가 렌더링됨 (AC-3.2)
  - URL `panelType` 파라미터가 `TIME_SERIES`로 변경됨 (AC-3.4)
- **엣지/부정 케이스**:
  - Table 뷰 전환 → `LogsExplorerTable` 렌더 확인 (AC-3.3)
  - List 복귀 → `LogsExplorerList` 렌더 확인 (AC-3.1)
- **테스트 위치(예정)**: `frontend/src/container/LogsExplorerViews/tests/LogsExplorerViews.test.tsx`
- **결정성 메모**: react-router 목킹으로 URL 파라미터 검증.

### TC-LE-4: 쿼리 취소
- **추적**: REQ-4 (AC-4.1, 4.2, 4.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: 쿼리 실행 중(isLoadingQueries=true) 상태
- **입력/동작 (When)**: Cancel 버튼 클릭
- **기대 결과 (Then)**:
  - 로딩 상태 해제 (AC-4.1)
  - `QueryCancelledPlaceholder` 렌더링 + "Run Query" 안내 문구 표시 (AC-4.2)
- **엣지/부정 케이스**: 취소 후 Run Query 재실행 → 정상 쿼리 수행 (AC-4.3)
- **테스트 위치(예정)**: `frontend/src/pages/LogsExplorer/__tests__/LogsExplorer.test.tsx`
- **결정성 메모**: react-query cancelQueries 목킹.

### TC-LE-5: Live Logs 스트리밍
- **추적**: REQ-5 (AC-5.1, 5.2, 5.3, 5.4)
- **레이어**: FE Jest
- **전제조건 (Given)**: LogsExplorer 마운트, List 뷰 상태
- **입력/동작 (When)**: "Go Live" 버튼 클릭
- **기대 결과 (Then)**:
  - LiveLogs 컴포넌트로 전환됨 (AC-5.1)
  - Timeseries/Table 뷰 버튼 비활성화 (AC-5.4)
- **엣지/부정 케이스**:
  - "Exit Live" 클릭 → 일반 모드 복귀 (AC-5.3)
  - SSE 메시지 수신 → 로그 행 추가 렌더 (AC-5.2)
- **테스트 위치(예정)**: `frontend/src/container/LiveLogs/__tests__/LiveLogs.test.tsx` (신규)
- **결정성 메모**: EventSource 목킹으로 SSE 시뮬레이션.

### TC-LE-6: 로그 필드 목록 조회
- **추적**: REQ-6 (AC-6.1, 6.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: ClickHouse Reader mock — `GetLogFields` 정상 응답 설정
- **입력/동작 (When)**: `GET /api/v1/logs/fields` 요청
- **기대 결과 (Then)**:
  - 응답에 `selected_fields`, `interesting_fields` 배열 포함 (AC-6.1)
  - HTTP 200 반환
- **엣지/부정 케이스**: GetLogFields 에러 시 500 반환 및 에러 메시지 포함
- **테스트 위치(예정)**: `pkg/query-service/app/logs_handler_test.go` (신규)
- **결정성 메모**: Reader mock 사용.

### TC-LE-7: 로그 필드 인덱스 수정
- **추적**: REQ-7 (AC-7.1, 7.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: Reader mock — `UpdateLogField` 정상 동작 설정
- **입력/동작 (When)**: `POST /api/v1/logs/fields` — 유효한 필드명 페이로드
- **기대 결과 (Then)**:
  - 변경된 필드 정보가 응답으로 반환됨 (AC-7.2)
  - HTTP 200 반환
- **엣지/부정 케이스**: 잘못된 필드명 → HTTP 400 + 에러 메시지 (AC-7.1)
- **테스트 위치(예정)**: `pkg/query-service/app/logs_handler_test.go` (신규)
- **결정성 메모**: logs.ValidateUpdateFieldPayload 로직 검증 포함.

### TC-LE-8: 로그 집계 조회
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: `GET /api/v1/logs/aggregate` 요청
- **입력/동작 (When)**: 집계 파라미터 없이 요청
- **기대 결과 (Then)**:
  - `GetLogsAggregatesResponse` 형식 응답 (AC-8.1)
  - 빈 items 배열도 200으로 응답 (AC-8.2)
- **엣지/부정 케이스**: 잘못된 집계 파라미터 → 400 반환
- **테스트 위치(예정)**: `pkg/query-service/app/logs_handler_test.go` (신규)
- **결정성 메모**: httptest 사용.

### TC-LE-9: 로그 파이프라인 관리
- **추적**: REQ-9 (AC-9.1, 9.2, 9.3)
- **레이어**: Go 단위
- **전제조건 (Given)**: 파이프라인 컨트롤러 mock 설정
- **입력/동작 (When)**: `GET /api/v1/logs/pipelines/latest` 요청
- **기대 결과 (Then)**:
  - 파이프라인 목록 반환 (AC-9.1)
- **엣지/부정 케이스**:
  - `POST /pipelines/preview` — 샘플 로그 변환 결과 반환 (AC-9.2)
  - `POST /pipelines` — 새 버전 생성 (AC-9.3)
- **테스트 위치(예정)**: `pkg/query-service/app/http_handler_test.go`
- **결정성 메모**: LogsParsingPipelineController mock 사용.

### TC-LE-10: 로딩 및 에러 처리
- **추적**: REQ-10 (AC-10.1, 10.2, 10.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 API 응답 지연/에러 설정
- **입력/동작 (When)**: Run Query 실행 (응답 지연 500ms 시뮬레이션)
- **기대 결과 (Then)**:
  - 로딩 중 스피너 렌더링 (AC-10.1)
- **엣지/부정 케이스**:
  - API 500 에러 → 에러 메시지 UI 표시 (AC-10.2)
  - 에러 후 Run Query 재실행 → 정상 동작 (AC-10.3)
- **테스트 위치(예정)**: `frontend/src/pages/LogsExplorer/__tests__/LogsExplorer.test.tsx`
- **결정성 메모**: MSW `server.use()` 로 에러 핸들러 주입.

## 미커버 항목 (Gap)
- SSE 재연결 로직 (네트워크 끊김 후 자동 재연결) — EventSource 목킹 한계로 E2E 검증 권장
- 대용량 로그(10만 건+) 페이지네이션 성능 — 부하 테스트 별도 필요

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| - | `pnpm jest src/pages/LogsExplorer` | - | 미실행 |
| - | `go test ./pkg/query-service/app/...` | - | 미실행 |
