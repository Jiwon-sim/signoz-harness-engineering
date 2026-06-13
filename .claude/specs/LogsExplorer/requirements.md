# Requirements — LogsExplorer (로그 탐색기)

> EARS(Easy Approach to Requirements Syntax) 형식.
> 상태: **Draft** · 작성일: 2026-06-13 · 에디션: **Community** (`pkg/query-service`)
> 관련 코드: [pages/LogsExplorer](../../../frontend/src/pages/LogsExplorer/index.tsx), [RegisterLogsRoutes](../../../pkg/query-service/app/http_handler.go)

## 1. 개요 (Introduction)
LogsExplorer는 SigNoz의 로그 탐색 기능으로, 개발자/SRE가 ClickHouse에 수집된 로그를
QueryBuilder 또는 빠른 필터(QuickFilters)로 검색·시각화·분석할 수 있게 한다.
List / Timeseries / Table 세 가지 뷰와 실시간 스트리밍(Live Logs)을 제공하며,
로그 필드 관리 및 파이프라인 설정을 통해 수집 파이프라인도 제어할 수 있다.

## 2. 용어 (Glossary)
- **QueryBuilder**: 필터·집계·시간 범위를 조합해 쿼리를 구성하는 UI 컴포넌트.
- **QuickFilters**: severity, service name, K8s 속성 등 자주 쓰는 필터를 체크박스로 빠르게 적용하는 사이드 패널.
- **Live Logs**: SSE(Server-Sent Events)로 신규 로그를 실시간 스트리밍하는 모드.
- **Log Field**: ClickHouse에 인덱싱된 로그 속성 키. 필터·집계에 사용된다.
- **Pipeline**: 수집 단계에서 로그를 변환·파싱하는 처리 규칙 집합.
- **ExplorerView**: List / Timeseries / Table 중 현재 선택된 결과 표시 방식.

## 3. 요구사항 (EARS)

### REQ-1: 로그 목록 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 QueryBuilder에 조건을 입력하고 Run Query를 실행하면 THE SYSTEM SHALL `/api/v3/query_range`를 호출해 ClickHouse에서 일치하는 로그 목록을 List 뷰로 표시한다.
- **근거**: 로그 탐색의 핵심 동작. 조건에 맞는 로그를 빠르게 확인해야 한다.
- **수용 기준**:
  - [ ] AC-1.1: Run Query 실행 시 로그 행이 테이블/리스트 형태로 렌더링된다.
  - [ ] AC-1.2: 결과는 `timestamp` 내림차순으로 정렬된다.
  - [ ] AC-1.3: 결과가 없을 때 빈 상태 UI를 표시한다.

### REQ-2: 빠른 필터 (QuickFilters)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 QuickFilters 패널에서 항목(severity_text, service.name, deployment.environment, host.name, k8s.* 등)을 선택하면 THE SYSTEM SHALL 해당 조건을 QueryBuilder 필터에 반영하고 자동으로 쿼리를 재실행한다.
- **근거**: 공통 필터를 매번 수동 입력하지 않고 빠르게 적용할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-2.1: 필터 항목 선택 시 QueryBuilder 필터 조건이 업데이트된다.
  - [ ] AC-2.2: QuickFilters 패널 표시/숨김 상태가 localStorage에 유지된다.
  - [ ] AC-2.3: 패널 숨김 시 결과 영역이 전체 너비로 확장된다.

### REQ-3: 뷰 전환 (List / Timeseries / Table)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 툴바에서 List / Timeseries / Table 뷰를 선택하면 THE SYSTEM SHALL 해당 뷰 컴포넌트로 전환하고 현재 QueryBuilder 상태를 유지한 채 결과를 다시 렌더링한다.
- **근거**: 로그를 상황에 따라 원문(List), 시계열 추세(Timeseries), 집계표(Table)로 볼 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-3.1: List 뷰 전환 시 로그 원문 행이 표시된다.
  - [ ] AC-3.2: Timeseries 뷰 전환 시 시계열 차트(`LogsExplorerChart`)가 표시된다.
  - [ ] AC-3.3: Table 뷰 전환 시 집계 테이블(`LogsExplorerTable`)이 표시된다.
  - [ ] AC-3.4: 뷰 전환 후 URL의 `panelType` 파라미터가 변경된다.

### REQ-4: 쿼리 취소
- **유형**: Event-driven
- **명세**: WHEN 사용자가 쿼리 실행 중 Cancel 버튼을 클릭하면 THE SYSTEM SHALL 진행 중인 react-query 요청을 취소하고 "Query Cancelled" 플레이스홀더를 표시한다.
- **근거**: 느린 쿼리가 UI를 블로킹하지 않도록 취소 수단을 제공해야 한다.
- **수용 기준**:
  - [ ] AC-4.1: 취소 후 로딩 상태가 해제된다.
  - [ ] AC-4.2: `QueryCancelledPlaceholder`가 렌더링되고 "Run Query" 안내 문구가 표시된다.
  - [ ] AC-4.3: 취소 후 Run Query를 다시 실행하면 정상 조회된다.

### REQ-5: Live Logs (실시간 스트리밍)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 "Go Live" 버튼을 클릭하면 THE SYSTEM SHALL `/api/v1/logs/livetail` SSE 엔드포인트에 연결해 신규 로그를 실시간으로 스트리밍한다.
- **근거**: 장애 대응 시 실시간 로그를 확인해야 한다.
- **수용 기준**:
  - [ ] AC-5.1: Go Live 클릭 시 LiveLogs 컴포넌트로 전환된다.
  - [ ] AC-5.2: 신규 로그가 수신될 때마다 화면 상단에 추가된다.
  - [ ] AC-5.3: "Exit Live" 클릭 시 SSE 연결이 종료되고 일반 조회 모드로 복귀한다.
  - [ ] AC-5.4: Live Logs 모드에서는 Timeseries/Table 뷰 전환이 비활성화된다.

### REQ-6: 로그 필드 조회
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL `GET /api/v1/logs/fields`를 통해 ClickHouse에 인덱싱된 로그 필드 목록을 제공하고, QueryBuilder 자동완성 및 QuickFilters에 사용한다.
- **근거**: 어떤 속성으로 필터·집계할 수 있는지 동적으로 알아야 한다.
- **수용 기준**:
  - [ ] AC-6.1: 응답에 `interesting_fields`와 `selected_fields` 배열이 포함된다.
  - [ ] AC-6.2: 필드 목록이 QueryBuilder 속성 자동완성에 반영된다.

### REQ-7: 로그 필드 인덱스 수정
- **유형**: Event-driven
- **명세**: WHEN 사용자가 특정 로그 필드의 인덱스 설정을 변경하면 THE SYSTEM SHALL `POST /api/v1/logs/fields`를 호출해 ClickHouse의 필드 인덱스 상태를 업데이트한다.
- **근거**: 자주 쓰는 필드를 인덱싱해 쿼리 성능을 높일 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-7.1: 유효하지 않은 필드명 요청 시 400 에러를 반환한다.
  - [ ] AC-7.2: 정상 업데이트 후 변경된 필드 정보를 응답으로 반환한다.

### REQ-8: 로그 집계 조회
- **유형**: Event-driven
- **명세**: WHEN Timeseries 또는 Table 뷰에서 집계 쿼리가 실행되면 THE SYSTEM SHALL `GET /api/v1/logs/aggregate`를 통해 집계 결과를 반환한다.
- **근거**: 시계열 트렌드나 서비스별 에러 건수 등 집계 분석이 필요하다.
- **수용 기준**:
  - [ ] AC-8.1: 집계 결과가 `GetLogsAggregatesResponse` 형식으로 반환된다.
  - [ ] AC-8.2: 결과 없음(빈 배열)도 정상 응답으로 처리된다.

### REQ-9: 로그 파이프라인 관리
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 로그 파이프라인의 목록 조회(`GET /pipelines/{version}`), 생성(`POST /pipelines`), 미리보기(`POST /pipelines/preview`)를 지원한다.
- **근거**: 수집 단계에서 로그를 파싱·변환하는 규칙을 UI에서 관리해야 한다.
- **수용 기준**:
  - [ ] AC-9.1: `GET /pipelines/latest`가 최신 파이프라인 목록을 반환한다.
  - [ ] AC-9.2: `POST /pipelines/preview`가 샘플 로그에 파이프라인 적용 결과를 반환한다.
  - [ ] AC-9.3: `POST /pipelines`가 새 파이프라인 버전을 생성한다.

### REQ-10: 로딩 및 에러 처리
- **유형**: State-driven / Unwanted
- **명세**:
  - WHILE 쿼리가 실행 중이면 THE SYSTEM SHALL 로딩 인디케이터를 표시하고 Run Query 버튼을 비활성화한다.
  - IF API 호출이 실패하면 THEN THE SYSTEM SHALL 에러 메시지를 표시하고 빈 결과를 보여준다.
- **근거**: 응답 지연·에러 시 사용자가 상태를 파악할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-10.1: 로딩 중 스피너 또는 로딩 상태 UI가 표시된다.
  - [ ] AC-10.2: API 에러 시 에러 메시지가 UI에 표시된다.
  - [ ] AC-10.3: 에러 후 Run Query 재실행이 가능하다.

## 4. 비기능 요구사항 (Non-functional)
- **성능**: 로그 목록 쿼리 응답 p95 < 3s (일반 필터 조건, 1일 범위 기준).
- **보안**: 조회 API는 ViewAccess, 필드 수정·파이프라인 생성은 EditAccess 권한 필요. 인증 없이 접근 불가.
- **에디션**: Community 범위. `ee/` 의존 없음.
- **호환성**: ClickHouse 스키마 변경 없이 기존 `system.logs` 테이블 사용.
- **관측성**: 쿼리 실행 시 `slog` + snake_case 키로 로깅. 에러는 `pkg/errors` 사용.

## 5. 범위 밖 (Out of scope)
- 로그 저장·수집 파이프라인 인프라 설정 (OTel Collector 설정).
- 로그 보존 정책(Retention) 변경 (`/api/v1/settings/logs` 별도 기능).
- AI Assistant 기반 자연어 로그 쿼리 (`AIAssistantPage` 별도 기능).
- `Trace` / `Clickhouse` 뷰 (현재 UI에서 `show: false` 비활성 상태).

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §3, §5 | TASK-1 | TC-LE-1 |
| REQ-2 | design.md §4 | TASK-2 | TC-LE-2 |
| REQ-3 | design.md §4 | TASK-2 | TC-LE-3 |
| REQ-4 | design.md §4 | TASK-2 | TC-LE-4 |
| REQ-5 | design.md §5 | TASK-3 | TC-LE-5 |
| REQ-6 | design.md §3 | TASK-1 | TC-LE-6 |
| REQ-7 | design.md §3 | TASK-1 | TC-LE-7 |
| REQ-8 | design.md §3 | TASK-1 | TC-LE-8 |
| REQ-9 | design.md §3 | TASK-1 | TC-LE-9 |
| REQ-10 | design.md §4 | TASK-2 | TC-LE-10 |
