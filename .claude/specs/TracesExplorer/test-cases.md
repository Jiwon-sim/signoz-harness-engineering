# Test Cases — TracesExplorer (트레이스 탐색기)

> 출처 스펙: `.claude/specs/TracesExplorer/requirements.md`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-TE-1 | REQ-1 / AC-1.1, 1.2, 1.3 | FE Jest | ✅ | [ ] |
| TC-TE-2 | REQ-2 / AC-2.1, 2.2 | FE Jest | ✅ | [ ] |
| TC-TE-3 | REQ-3 / AC-3.1, 3.2, 3.3, 3.4 | FE Jest | ✅ | [ ] |
| TC-TE-4 | REQ-4 / AC-4.1, 4.2 | Go 단위 | ✅ | [ ] |
| TC-TE-5 | REQ-5 / AC-5.1, 5.2, 5.3 | FE Jest | ✅ | [ ] |
| TC-TE-6 | REQ-6 / AC-6.1, 6.2 | Go 단위 | ✅ | [ ] |
| TC-TE-7 | REQ-7 / AC-7.1, 7.2 | FE Jest | ✅ | [ ] |
| TC-TE-8 | REQ-8 / AC-8.1, 8.2 | FE Jest | ✅ | [ ] |
| TC-TE-9 | REQ-9 / AC-9.1, 9.2 | FE Jest | ✅ | [ ] |

## 테스트 케이스 상세

### TC-TE-1: 트레이스 목록 조회
- **추적**: REQ-1 (AC-1.1, 1.2, 1.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `/api/v3/query_range` 응답 목킹 (트레이스 3건)
- **입력/동작 (When)**: Run Query 클릭
- **기대 결과 (Then)**:
  - 트레이스 행 3건 렌더링 (AC-1.1)
  - 각 행에 traceId, 서비스명, duration, 상태 표시 (AC-1.2)
- **엣지/부정 케이스**: 빈 응답 → 빈 상태 UI 표시 (AC-1.3)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: MSW 고정 응답 사용.

### TC-TE-2: QuickFilters 적용
- **추적**: REQ-2 (AC-2.1, 2.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: TracesExplorer 마운트
- **입력/동작 (When)**: 서비스명 QuickFilter 선택
- **기대 결과 (Then)**:
  - QueryBuilder WHERE 조건에 서비스명 필터 추가 (AC-2.1)
- **엣지/부정 케이스**: 패널 토글 → localStorage 상태 유지 (AC-2.2)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: localStorage 목킹.

### TC-TE-3: 뷰 전환
- **추적**: REQ-3 (AC-3.1, 3.2, 3.3, 3.4)
- **레이어**: FE Jest
- **전제조건 (Given)**: TracesExplorer 마운트, 기본 List 뷰
- **입력/동작 (When)**: "Timeseries" 뷰 버튼 클릭
- **기대 결과 (Then)**:
  - `TracesView` 차트 컴포넌트 렌더링 (AC-3.2)
  - URL `panelType=TIME_SERIES` 변경 (AC-3.4)
- **엣지/부정 케이스**:
  - Table 전환 → `TableView` 렌더 (AC-3.3)
  - List 복귀 → `ListView` 렌더 (AC-3.1)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: react-router 목킹.

### TC-TE-4: 트레이스 상세 조회
- **추적**: REQ-4 (AC-4.1, 4.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: Reader mock — 특정 traceId의 스팬 목록 반환
- **입력/동작 (When)**: `GET /api/v1/traces/{traceId}`
- **기대 결과 (Then)**:
  - 응답에 traceId와 스팬 목록 포함 (AC-4.1)
  - HTTP 200 반환
- **엣지/부정 케이스**: 존재하지 않는 traceId → 404 반환
- **테스트 위치(예정)**: `pkg/query-service/app/traces_handler_test.go` (신규)
- **결정성 메모**: httptest + Reader mock.

### TC-TE-5: 플레임그래프
- **추적**: REQ-5 (AC-5.1, 5.2, 5.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `/api/v2/traces/flamegraph/{traceId}` 응답 목킹 (스팬 10개)
- **입력/동작 (When)**: 트레이스 상세 페이지 진입
- **기대 결과 (Then)**:
  - 플레임그래프 컴포넌트 렌더링 + 스팬 계층 표시 (AC-5.1)
- **엣지/부정 케이스**:
  - 스팬 클릭 → 속성 사이드 패널 표시 (AC-5.2)
  - 100개 이상 스팬 → 페이지네이션 렌더 (AC-5.3)
- **테스트 위치(예정)**: `frontend/src/container/PaginatedTraceFlamegraph/__tests__/` (신규)
- **결정성 메모**: 스팬 수 고정 목킹.

### TC-TE-6: 트레이스 필드 조회
- **추적**: REQ-6 (AC-6.1, 6.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: Reader mock — 트레이스 필드 목록 반환
- **입력/동작 (When)**: `GET /api/v2/traces/fields`
- **기대 결과 (Then)**:
  - 트레이스 필드 목록 포함 응답 (AC-6.1)
  - HTTP 200 반환
- **엣지/부정 케이스**: DB 오류 시 500 반환
- **테스트 위치(예정)**: `pkg/query-service/app/traces_handler_test.go` (신규)
- **결정성 메모**: Reader mock.

### TC-TE-7: 대시보드 내보내기
- **추적**: REQ-7 (AC-7.1, 7.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: TracesExplorer 마운트, 쿼리 실행 완료 상태
- **입력/동작 (When)**: "Export to Dashboard" 버튼 클릭
- **기대 결과 (Then)**:
  - 대시보드 선택 모달 표시 (AC-7.1)
- **엣지/부정 케이스**: 대시보드 선택 후 확인 → 해당 대시보드에 패널 추가 (AC-7.2)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: generateExportToDashboardLink 유틸 단위 테스트 포함.

### TC-TE-8: 쿼리 취소
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 쿼리 실행 중 상태
- **입력/동작 (When)**: Cancel 버튼 클릭
- **기대 결과 (Then)**:
  - 로딩 해제 + `QueryCancelledPlaceholder` 표시 (AC-8.1)
- **엣지/부정 케이스**: 취소 후 Run Query → 정상 쿼리 수행 (AC-8.2)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: react-query cancelQueries 목킹.

### TC-TE-9: 로딩 및 에러 처리
- **추적**: REQ-9 (AC-9.1, 9.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 API 응답 지연/500 에러 설정
- **입력/동작 (When)**: Run Query 실행
- **기대 결과 (Then)**:
  - 로딩 중 스피너 렌더링 (AC-9.1)
- **엣지/부정 케이스**: 500 에러 → 에러 메시지 UI 표시 (AC-9.2)
- **테스트 위치(예정)**: `frontend/src/pages/TracesExplorer/__test__/TracesExplorer.test.tsx`
- **결정성 메모**: MSW 에러 핸들러 주입.

## 미커버 항목 (Gap)
- 수천 개 스팬 트레이스의 플레임그래프 렌더링 성능 — 부하 테스트 별도 필요
- traceId 직접 검색(SearchTraceID) 동작 — 별도 TC 추가 권장

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| - | `pnpm jest src/pages/TracesExplorer` | - | 미실행 |
| - | `go test ./pkg/query-service/app/...` | - | 미실행 |
