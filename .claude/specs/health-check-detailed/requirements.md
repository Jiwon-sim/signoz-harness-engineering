# Requirements — health-check-detailed (상세 헬스체크)

> EARS 형식. 작성법: `/create-spec` 커맨드의 "EARS 작성법" 절 참조.
> 상태: **Draft (검토 요청)** · 작성일: 2026-06-11 · 에디션: **Community** (`pkg/query-service`)
> 관련: 기존 엔드포인트 `/api/v1/health` ([http_handler.go](../../../pkg/query-service/app/http_handler.go))

## 1. 개요 (Introduction)
SigNoz 의 기존 `/api/v1/health` 는 `{"status":"ok"}` 만 반환하고, `?live` 옵션으로 ClickHouse 연결만
단순 확인한다. 이를 **컴포넌트별 상세 진단**(ClickHouse 상태·응답시간 + 디스크 용량)으로 확장해,
운영자/K8s readiness probe 가 "무엇이 왜 비정상인지"를 알 수 있게 한다. 관측 데이터 유무와 무관하게
시스템 자체 상태를 보고한다.

## 2. 용어 (Glossary)
- **상세 헬스(detailed health)**: 각 핵심 의존성의 상태를 구조화해 담은 응답.
- **체크(check)**: 개별 의존성 진단 단위 (예: clickhouse, disk).
- **degraded**: 하나 이상의 체크가 실패한 전체 상태.

## 3. 요구사항 (EARS)

### REQ-1: 상세 헬스 응답
- **유형**: Event-driven
- **명세**: WHEN 클라이언트가 상세 헬스(예: `/api/v1/health?detailed`)를 요청하면 THE SYSTEM SHALL 각 핵심 의존성의 상태를 구조화된 JSON(`checks`)으로 반환한다.
- **근거**: 단일 "ok"로는 장애 원인 파악 불가.
- **수용 기준**:
  - [x] AC-1.1: detailed 요청 시 응답에 `status`와 `checks` 객체가 포함된다.
  - [x] AC-1.2: `checks`에 최소 `clickhouse`, `disk` 항목이 포함된다.
  - [x] AC-1.3: 각 체크는 자신의 `status`(healthy/unhealthy)를 가진다.

### REQ-2: ClickHouse 상태 보고
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 상세 헬스에서 ClickHouse 연결 상태를 보고하고, 가능하면 응답 지연(latency)을 포함한다.
- **근거**: ClickHouse 는 핵심 데이터 스토어. 연결 가부와 지연이 운영 핵심 지표.
- **수용 기준**:
  - [x] AC-2.1: ClickHouse 정상 연결 시 `clickhouse.status = "healthy"`.
  - [x] AC-2.2: ClickHouse 연결 실패 시 `clickhouse.status = "unhealthy"`.
  - [x] AC-2.3: 정상 시 `latency_ms`(또는 동등 필드)를 포함한다.

### REQ-3: 디스크 용량 보고
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL ClickHouse 스토리지의 디스크 여유/총량/사용률을 보고한다.
- **근거**: 디스크 소진은 관측 파이프라인 중단의 흔한 원인.
- **수용 기준**:
  - [x] AC-3.1: `disk`에 여유 공간·총 공간·사용률(%) 정보가 포함된다.
  - [x] AC-3.2: ClickHouse `system.disks` 기반으로 조회한다.
  - [x] AC-3.3: 디스크 사용률이 임계치(90%)를 넘으면 `disk.status = "unhealthy"`.

### REQ-4: 전체 상태 판정
- **유형**: Unwanted
- **명세**: IF 하나 이상의 핵심 체크가 실패하면 THEN THE SYSTEM SHALL 전체 `status`를 비정상(`degraded`)으로 표시하고 HTTP 503을 반환한다.
- **근거**: K8s readiness probe 가 비정상을 인지해야 트래픽을 끊는다.
- **수용 기준**:
  - [x] AC-4.1: 모든 체크 정상 → HTTP 200 + `status = "ok"`.
  - [x] AC-4.2: 하나 이상 실패 → HTTP 503 + `status = "degraded"`.

### REQ-5: 기존 동작 호환
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 기존 `/api/v1/health` 의 기본 응답과 `?live` 동작을 변경 없이 유지한다.
- **근거**: 기존 클라이언트·프로브 회귀 방지.
- **수용 기준**:
  - [x] AC-5.1: 파라미터 없는 요청은 기존 `{"status":"ok"}` 를 그대로 반환한다. (코드 리뷰: 기존 분기 보존, 실제 실행은 선택 검증)
  - [x] AC-5.2: `?live` 는 기존 ClickHouse 연결 체크 동작을 유지한다. (코드 리뷰: 기존 분기 보존)

### REQ-6: System Health 화면 (Frontend)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 Settings > System Health 페이지에 진입하면 THE SYSTEM SHALL `/api/v1/health?detailed` 를 호출해 ClickHouse 상태·지연과 디스크 사용률을 화면에 표시한다.
- **근거**: 운영자가 CLI/curl 없이 UI 에서 시스템 상태를 확인할 수 있어야 한다.
- **수용 기준**:
  - [x] AC-6.1: `/settings/system-health` 라우트로 진입 가능하다. (routes/config/utils/menuItems 배선)
  - [x] AC-6.2: ClickHouse 카드에 상태와 `latency_ms` 가 표시된다. (HealthCard, 테스트 검증)
  - [x] AC-6.3: 디스크 카드에 사용률(%)·여유/총 용량이 표시된다.
  - [x] AC-6.4: API 호출은 react-query 로 수행한다 (`useGetDetailedHealth`).

### REQ-7: 상태 시각화 (Frontend)
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 각 체크의 상태(healthy / unhealthy)와 전체 상태(ok / degraded)를 색상·라벨로 구분해 표시한다.
- **근거**: 비정상을 한눈에 식별해야 한다.
- **수용 기준**:
  - [x] AC-7.1: healthy/ok 는 긍정 색(`forest`), unhealthy/degraded 는 경고 색(`cherry`)으로 구분한다.
  - [x] AC-7.2: 상호작용·표시 요소에 `data-testid` 를 부여한다.

### REQ-8: 로딩·에러 처리 (Frontend)
- **유형**: Unwanted
- **명세**: WHILE 조회 중이면 THE SYSTEM SHALL 로딩 표시를 유지하고, IF 호출이 실패하면 THEN THE SYSTEM SHALL 에러 상태 UI 를 표시한다.
- **근거**: degraded 시 503 응답도 화면이 깨지지 않고 상태를 보여줘야 한다.
- **수용 기준**:
  - [x] AC-8.1: 조회 중 로딩 인디케이터를 표시한다. (Spin, 테스트 검증)
  - [x] AC-8.2: 503(degraded) 응답도 정상적으로 파싱해 상태를 표시한다. (`getDetailedHealth` 503→payload, 테스트 검증)

## 4. 비기능 요구사항 (Non-functional)
- **성능**: 헬스체크는 빠르게 응답. ClickHouse 쿼리에 타임아웃(예: 수 초)을 두어 무한 대기 방지.
- **보안/접근**: 기존처럼 인증 없이 접근 가능(OpenAccess) — K8s 프로브 용도. 단 민감 정보(경로 등) 과다 노출 금지.
- **코딩 규칙**: 에러는 `pkg/errors`, 로깅은 `slog`(snake_case). ([[backend-go]])
- **에디션**: Community 범위. `ee/` 의존 없음.

## 5. 범위 밖 (Out of scope)
- `/api/v2/healthz`·`readyz`·`livez` (factory 레벨 프로브) 변경.
- 메타스토어(SQLite/Postgres) 디스크, 호스트 OS 메모리/CPU 체크.
- 인증·권한 추가.

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | §3, §5 | TASK-2 | TC-HC-1 (TestBuildDetailedHealth) |
| REQ-2 | §3, §5 | TASK-1, 2 | TC-HC-2 (clickhouse down) |
| REQ-3 | §3, §4, §5 | TASK-1, 2 | TC-HC-3 (disk nearly full / metrics) |
| REQ-4 | §5 | TASK-2 | TC-HC-4 (degraded → 503) |
| REQ-5 | §4 | TASK-2 | TC-HC-5 (코드 리뷰 + 실제 실행) |
| REQ-6 | §FE | TASK-4, 5 | TC-HC-6 (페이지 렌더 + API 호출) |
| REQ-7 | §FE | TASK-5 | TC-HC-7 (상태별 색상·라벨) |
| REQ-8 | §FE | TASK-5 | TC-HC-8 (로딩/에러/503 처리) |
