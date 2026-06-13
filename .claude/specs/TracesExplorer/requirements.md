# Requirements — TracesExplorer (트레이스 탐색기)

> EARS(Easy Approach to Requirements Syntax) 형식.
> 상태: **Draft** · 작성일: 2026-06-13 · 에디션: **Community** (`pkg/query-service`)
> 관련 코드: [pages/TracesExplorer](../../../frontend/src/pages/TracesExplorer/index.tsx), [http_handler.go](../../../pkg/query-service/app/http_handler.go)

## 1. 개요 (Introduction)
TracesExplorer는 SigNoz의 분산 추적 탐색 기능으로, 개발자/SRE가 OpenTelemetry로 수집된
트레이스·스팬을 QueryBuilder와 QuickFilters로 검색·시각화할 수 있게 한다.
List / Timeseries / Table 세 가지 뷰와 트레이스 상세(플레임그래프·간트 차트)를 제공하며,
분산 요청의 병목 지점과 오류를 빠르게 식별할 수 있다.

## 2. 용어 (Glossary)
- **Trace**: 하나의 요청이 여러 서비스를 거치며 생성된 스팬의 집합. 고유 `traceId`로 식별.
- **Span**: 트레이스 내 단일 작업 단위. 시작·종료 시각, 상태, 속성을 가짐.
- **Flamegraph**: 스팬 계층을 시각화한 차트. 병목 구간을 한눈에 파악.
- **QuickFilters**: 서비스명, HTTP 상태코드, duration 등 자주 쓰는 필터 사이드 패널.
- **ExplorerView**: List / Timeseries / Table 중 현재 선택된 결과 표시 방식.

## 3. 요구사항 (EARS)

### REQ-1: 트레이스 목록 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 QueryBuilder에 조건을 입력하고 Run Query를 실행하면 THE SYSTEM SHALL `/api/v3/query_range`를 호출해 일치하는 트레이스 목록을 List 뷰로 표시한다.
- **근거**: 특정 조건(서비스·오류·지연)에 맞는 트레이스를 빠르게 찾아야 한다.
- **수용 기준**:
  - [ ] AC-1.1: Run Query 실행 시 트레이스 행이 테이블 형태로 렌더링된다.
  - [ ] AC-1.2: 각 행에 traceId, 서비스명, duration, 상태가 표시된다.
  - [ ] AC-1.3: 결과가 없을 때 빈 상태 UI를 표시한다.

### REQ-2: 빠른 필터 (QuickFilters)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 QuickFilters 패널에서 서비스명·HTTP 상태·duration 등을 선택하면 THE SYSTEM SHALL QueryBuilder 필터에 반영하고 자동으로 쿼리를 재실행한다.
- **근거**: 자주 쓰는 필터를 빠르게 적용해 탐색 속도를 높여야 한다.
- **수용 기준**:
  - [ ] AC-2.1: 필터 선택 시 QueryBuilder 조건이 업데이트된다.
  - [ ] AC-2.2: QuickFilters 표시/숨김 상태가 localStorage에 유지된다.

### REQ-3: 뷰 전환 (List / Timeseries / Table)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 툴바에서 List / Timeseries / Table 뷰를 선택하면 THE SYSTEM SHALL 해당 뷰 컴포넌트로 전환하고 URL `panelType` 파라미터를 갱신한다.
- **근거**: 트레이스를 원문(List), 시계열 추세(Timeseries), 집계표(Table)로 볼 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-3.1: List 뷰 — `ListView` 컴포넌트가 렌더링된다.
  - [ ] AC-3.2: Timeseries 뷰 — `TracesView` 차트가 렌더링된다.
  - [ ] AC-3.3: Table 뷰 — `TableView` 집계 테이블이 렌더링된다.
  - [ ] AC-3.4: 뷰 전환 후 URL `panelType` 파라미터가 변경된다.

### REQ-4: 트레이스 상세 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 목록에서 특정 traceId를 클릭하면 THE SYSTEM SHALL `GET /api/v1/traces/{traceId}`를 호출해 해당 트레이스의 전체 스팬을 반환한다.
- **근거**: 단일 요청의 전체 수명 주기와 병목 지점을 분석해야 한다.
- **수용 기준**:
  - [ ] AC-4.1: 응답에 traceId와 스팬 목록이 포함된다.
  - [ ] AC-4.2: 트레이스 상세 페이지(`/trace/{traceId}`)로 이동한다.

### REQ-5: 플레임그래프 (Flamegraph)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 트레이스 상세 페이지에 진입하면 THE SYSTEM SHALL `POST /api/v2/traces/flamegraph/{traceId}`를 호출해 스팬 계층 구조를 플레임그래프로 시각화한다.
- **근거**: 스팬 계층과 병목 구간을 한눈에 파악해야 한다.
- **수용 기준**:
  - [ ] AC-5.1: 플레임그래프가 스팬 계층 구조를 시각적으로 표시한다.
  - [ ] AC-5.2: 스팬 클릭 시 해당 스팬의 속성·이벤트가 사이드 패널에 표시된다.
  - [ ] AC-5.3: 페이지네이션으로 대용량 트레이스도 로딩 가능하다.

### REQ-6: 트레이스 필드 관리
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL `GET /api/v2/traces/fields`를 통해 트레이스 속성 목록을 제공하고, QueryBuilder 자동완성에 사용한다.
- **근거**: 어떤 스팬 속성으로 필터·집계할 수 있는지 동적으로 알아야 한다.
- **수용 기준**:
  - [ ] AC-6.1: 응답에 트레이스 필드 목록이 포함된다.
  - [ ] AC-6.2: 필드 목록이 QueryBuilder 자동완성에 반영된다.

### REQ-7: 대시보드 내보내기
- **유형**: Event-driven
- **명세**: WHEN 사용자가 "Export to Dashboard" 버튼을 클릭하면 THE SYSTEM SHALL 현재 쿼리를 대시보드 패널 형식으로 변환해 지정된 대시보드에 추가할 수 있는 링크를 생성한다.
- **근거**: 반복 모니터링이 필요한 트레이스 쿼리를 대시보드에 저장해야 한다.
- **수용 기준**:
  - [ ] AC-7.1: Export 버튼 클릭 시 대시보드 선택 모달이 표시된다.
  - [ ] AC-7.2: 선택 후 해당 대시보드에 패널이 추가된다.

### REQ-8: 쿼리 취소
- **유형**: Event-driven
- **명세**: WHEN 사용자가 쿼리 실행 중 Cancel 버튼을 클릭하면 THE SYSTEM SHALL 진행 중인 요청을 취소하고 `QueryCancelledPlaceholder`를 표시한다.
- **근거**: 느린 쿼리가 UI를 블로킹하지 않도록 취소 수단을 제공해야 한다.
- **수용 기준**:
  - [ ] AC-8.1: 취소 후 로딩 상태가 해제되고 플레이스홀더가 표시된다.
  - [ ] AC-8.2: 취소 후 Run Query 재실행이 가능하다.

### REQ-9: 로딩 및 에러 처리
- **유형**: State-driven / Unwanted
- **명세**:
  - WHILE 쿼리가 실행 중이면 THE SYSTEM SHALL 로딩 인디케이터를 표시한다.
  - IF API 호출이 실패하면 THEN THE SYSTEM SHALL 에러 메시지를 표시하고 빈 결과를 보여준다.
- **근거**: 응답 지연·에러 시 사용자가 상태를 파악할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-9.1: 로딩 중 스피너가 표시된다.
  - [ ] AC-9.2: API 에러 시 에러 메시지가 UI에 표시된다.

## 4. 비기능 요구사항 (Non-functional)
- **성능**: 트레이스 목록 쿼리 응답 p95 < 3s (1일 범위, 일반 필터 조건 기준).
- **보안**: 조회 API는 ViewAccess, 필드 수정은 EditAccess 권한 필요.
- **에디션**: Community 범위. `ee/` 의존 없음.
- **확장성**: 대용량 트레이스(스팬 수천 개)는 페이지네이션 플레임그래프(`PaginatedTraceFlamegraph`)로 처리.

## 5. 범위 밖 (Out of scope)
- TraceFunnels (별도 기능 — `TracesFunnels` 페이지).
- 트레이스 데이터 수집·샘플링 설정 (OTel Collector 설정).
- AI Assistant 자연어 트레이스 쿼리 (별도 기능).

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §3, §4 | TASK-1 | TC-TE-1 |
| REQ-2 | design.md §4 | TASK-2 | TC-TE-2 |
| REQ-3 | design.md §4 | TASK-2 | TC-TE-3 |
| REQ-4 | design.md §3 | TASK-1 | TC-TE-4 |
| REQ-5 | design.md §3 | TASK-1 | TC-TE-5 |
| REQ-6 | design.md §3 | TASK-1 | TC-TE-6 |
| REQ-7 | design.md §4 | TASK-2 | TC-TE-7 |
| REQ-8 | design.md §4 | TASK-2 | TC-TE-8 |
| REQ-9 | design.md §4 | TASK-2 | TC-TE-9 |
