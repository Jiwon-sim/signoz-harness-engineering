# Requirements — APM / Services (애플리케이션 성능 모니터링)

> EARS(Easy Approach to Requirements Syntax) 형식.
> 상태: **Draft** · 작성일: 2026-06-13 · 에디션: **Community** (`pkg/query-service`, `pkg/modules/services`)
> 관련 코드: [pages/Services](../../../frontend/src/pages/Services/index.tsx), [container/ServiceApplication](../../../frontend/src/container/ServiceApplication/), [http_handler.go](../../../pkg/query-service/app/http_handler.go)

## 1. 개요 (Introduction)
APM/Services는 SigNoz의 애플리케이션 성능 모니터링 기능으로, OpenTelemetry로 계측된
서비스들의 RED 메트릭(Rate·Errors·Duration)을 실시간으로 집계·시각화한다.
개발자/SRE가 서비스 목록에서 성능 이상을 빠르게 감지하고, 개별 서비스의 핵심 작업과
트레이스를 드릴다운할 수 있게 한다.

## 2. 용어 (Glossary)
- **RED 메트릭**: Rate(초당 요청 수), Errors(에러율), Duration(응답 지연) — APM의 핵심 지표.
- **Service**: OTel `service.name` 속성으로 식별되는 독립 애플리케이션 단위.
- **Top Operations**: 서비스 내에서 가장 많이 호출되거나 느린 스팬 작업 목록.
- **Entry Point Operation**: 외부 트래픽이 최초로 진입하는 스팬 작업.
- **Apdex**: 응답 시간 만족도 점수 (0~1). 사용자 경험 측정 지표.
- **p99 Latency**: 전체 요청 중 99번째 백분위 응답 시간.

## 3. 요구사항 (EARS)

### REQ-1: 서비스 목록 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 Services 페이지(`/services`)에 진입하면 THE SYSTEM SHALL `POST /api/v2/services`를 호출해 전체 서비스의 RED 메트릭(rate, error rate, p99 latency)을 테이블로 표시한다.
- **근거**: 모든 서비스의 상태를 한 화면에서 비교·파악해야 한다.
- **수용 기준**:
  - [ ] AC-1.1: 서비스명·rate·error rate·p99 latency·Apdex가 테이블에 표시된다.
  - [ ] AC-1.2: 시간 범위 선택기로 조회 기간을 변경할 수 있다.
  - [ ] AC-1.3: 서비스가 없을 때 온보딩 안내가 표시된다.

### REQ-2: 서비스 목록 필터링
- **유형**: Event-driven
- **명세**: WHEN 사용자가 환경(environment) 필터를 변경하면 THE SYSTEM SHALL 해당 환경의 서비스만 필터링해 표시한다.
- **근거**: 프로덕션·스테이징 등 환경별로 서비스를 구분해 볼 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-2.1: 환경 드롭다운에서 선택 시 목록이 필터링된다.
  - [ ] AC-2.2: 필터 상태가 URL 파라미터로 유지된다.

### REQ-3: 서비스 상세 — 메트릭
- **유형**: Event-driven
- **명세**: WHEN 사용자가 특정 서비스를 클릭하면 THE SYSTEM SHALL 해당 서비스의 시계열 RED 메트릭 차트(rate, error rate, duration 추이)를 표시한다.
- **근거**: 서비스의 성능 변화를 시간 축으로 파악해야 한다.
- **수용 기준**:
  - [ ] AC-3.1: Rate / Error Rate / Duration 시계열 차트가 렌더링된다.
  - [ ] AC-3.2: 시간 범위 변경 시 차트가 갱신된다.
  - [ ] AC-3.3: `/api/v3/query_range`를 사용해 ClickHouse에서 메트릭을 조회한다.

### REQ-4: 서비스 상세 — 핵심 작업 (Top Operations)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 서비스 상세의 Operations 탭에 진입하면 THE SYSTEM SHALL `POST /api/v2/service/top_operations`를 호출해 호출량·에러율·지연 기준 상위 작업 목록을 표시한다.
- **근거**: 서비스 내에서 병목이 되는 특정 작업을 빠르게 식별해야 한다.
- **수용 기준**:
  - [ ] AC-4.1: 작업명·호출 수·에러율·p99 latency가 테이블에 표시된다.
  - [ ] AC-4.2: 작업 클릭 시 해당 작업의 트레이스 목록으로 이동한다.

### REQ-5: 서비스 상세 — 트레이스
- **유형**: Event-driven
- **명세**: WHEN 사용자가 서비스 상세의 Traces 탭에 진입하면 THE SYSTEM SHALL 해당 서비스의 최근 트레이스 목록을 `/api/v3/query_range`로 조회해 표시한다.
- **근거**: 성능 이상의 원인이 되는 트레이스를 서비스 컨텍스트 안에서 바로 확인해야 한다.
- **수용 기준**:
  - [ ] AC-5.1: 서비스 필터가 자동 적용된 트레이스 목록이 표시된다.
  - [ ] AC-5.2: traceId 클릭 시 트레이스 상세 페이지로 이동한다.

### REQ-6: 진입점 작업 (Entry Point Operations)
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL `POST /api/v2/service/entry_point_operations`를 통해 외부 트래픽이 진입하는 최상위 스팬 작업 목록을 제공한다.
- **근거**: 외부 요청의 시작점을 파악해 서비스 경계를 명확히 해야 한다.
- **수용 기준**:
  - [ ] AC-6.1: 진입점 작업 목록이 Operations 탭에 구분되어 표시된다.

### REQ-7: Apdex 점수 표시
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 각 서비스의 Apdex 점수를 계산해 서비스 목록과 상세에 표시한다.
- **근거**: 사용자 만족도 관점의 단일 지표로 서비스 건강도를 빠르게 판단해야 한다.
- **수용 기준**:
  - [ ] AC-7.1: Apdex 점수(0.0~1.0)가 테이블 컬럼에 표시된다.
  - [ ] AC-7.2: Apdex 임계값(T값)이 서비스별로 설정 가능하다.

### REQ-8: 로딩 및 에러 처리
- **유형**: State-driven / Unwanted
- **명세**:
  - WHILE 서비스 메트릭을 조회 중이면 THE SYSTEM SHALL 로딩 인디케이터를 표시한다.
  - IF API 호출이 실패하면 THEN THE SYSTEM SHALL 에러 메시지를 표시한다.
- **근거**: 응답 지연·에러 시 사용자가 상태를 파악할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-8.1: 로딩 중 스피너 또는 스켈레톤 UI가 표시된다.
  - [ ] AC-8.2: API 에러 시 에러 메시지와 재시도 옵션이 표시된다.

## 4. 비기능 요구사항 (Non-functional)
- **성능**: 서비스 목록 로드 p95 < 3s (서비스 50개, 1시간 범위 기준).
- **보안**: 모든 APM API는 ViewAccess 권한 필요.
- **에디션**: Community 범위. `pkg/modules/services`, `pkg/modules/apdex` 사용.
- **데이터 소스**: ClickHouse (트레이스 테이블)에서 스팬 집계로 RED 메트릭 계산.

## 5. 범위 밖 (Out of scope)
- 서비스 의존성 맵(Service Map) — 별도 기능.
- 서비스별 SLO/SLA 설정.
- 코드 레벨 프로파일링.

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §3, §4 | TASK-1 | TC-APM-1 |
| REQ-2 | design.md §4 | TASK-2 | TC-APM-2 |
| REQ-3 | design.md §3, §4 | TASK-1, 2 | TC-APM-3 |
| REQ-4 | design.md §3 | TASK-1 | TC-APM-4 |
| REQ-5 | design.md §4 | TASK-2 | TC-APM-5 |
| REQ-6 | design.md §3 | TASK-1 | TC-APM-6 |
| REQ-7 | design.md §3, §4 | TASK-1, 2 | TC-APM-7 |
| REQ-8 | design.md §4 | TASK-2 | TC-APM-8 |
