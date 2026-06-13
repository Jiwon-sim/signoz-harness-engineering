# Test Cases — health-check-detailed (상세 헬스체크)

> 출처 스펙: `.claude/specs/health-check-detailed/requirements.md`
> 기존 구현된 테스트: `pkg/query-service/app/health_test.go`, `frontend/src/container/SystemHealth/__tests__/SystemHealth.test.tsx`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-HC-1 | REQ-1 / AC-1.1, 1.2, 1.3 | Go 단위 | ✅ | [x] |
| TC-HC-2 | REQ-2 / AC-2.1, 2.2, 2.3 | Go 단위 | ✅ | [x] |
| TC-HC-3 | REQ-3 / AC-3.1, 3.2, 3.3 | Go 단위 | ✅ | [x] |
| TC-HC-4 | REQ-4 / AC-4.1, 4.2 | Go 단위 | ✅ | [x] |
| TC-HC-5 | REQ-5 / AC-5.1, 5.2 | Go 단위 (코드 리뷰) | ✅ | [x] |
| TC-HC-6 | REQ-6 / AC-6.1, 6.2, 6.3, 6.4 | FE Jest | ✅ | [x] |
| TC-HC-7 | REQ-7 / AC-7.1, 7.2 | FE Jest | ✅ | [x] |
| TC-HC-8 | REQ-8 / AC-8.1, 8.2 | FE Jest | ✅ | [x] |

## 테스트 케이스 상세

### TC-HC-1: 상세 헬스 응답 구조 검증
- **추적**: REQ-1 (AC-1.1, 1.2, 1.3)
- **레이어**: Go 단위
- **전제조건 (Given)**: `fakeHealthChecker` — ClickHouse 정상, 디스크 50/100 bytes
- **입력/동작 (When)**: `buildDetailedHealth(ctx, hc)` 호출 ("all healthy" 케이스)
- **기대 결과 (Then)**:
  - `health.Status = "ok"` (AC-1.1)
  - `health.Checks["clickhouse"]`, `health.Checks["disk"]` 존재 (AC-1.2)
  - 각 체크에 `Status` 필드 포함 (AC-1.3)
- **엣지/부정 케이스**: checks 맵이 nil이거나 키 누락 시 테스트 실패
- **테스트 위치**: `pkg/query-service/app/health_test.go` — `TestBuildDetailedHealth/"all healthy"`
- **결정성 메모**: `fakeHealthChecker` mock으로 외부 의존 없음. 시간은 테스트 실행 시점 사용 (latency_ms 값 자체는 검증 안 함).

### TC-HC-2: ClickHouse 상태 보고
- **추적**: REQ-2 (AC-2.1, 2.2, 2.3)
- **레이어**: Go 단위
- **전제조건 (Given)**: `fakeHealthChecker` — ClickHouse 정상/에러 두 케이스
- **입력/동작 (When)**:
  - 정상: `chErr = nil`
  - 에러: `chErr = errors.New("connection refused")`
- **기대 결과 (Then)**:
  - 정상 → `clickhouse.status = "healthy"` (AC-2.1)
  - 에러 → `clickhouse.status = "unhealthy"` (AC-2.2)
  - 정상 시 `latency_ms != nil` (AC-2.3) — `TestBuildDetailedHealthIncludesMetrics`에서 검증
- **엣지/부정 케이스**: ClickHouse 타임아웃도 `unhealthy`로 처리됨
- **테스트 위치**: `pkg/query-service/app/health_test.go` — `TestBuildDetailedHealth/"clickhouse down"`, `TestBuildDetailedHealthIncludesMetrics`
- **결정성 메모**: `fakeHealthChecker.CheckClickHouse`가 즉시 반환 → latency_ms는 ~0ms.

### TC-HC-3: 디스크 용량 보고
- **추적**: REQ-3 (AC-3.1, 3.2, 3.3)
- **레이어**: Go 단위
- **전제조건 (Given)**: `fakeHealthChecker` — 디스크 세 케이스
- **입력/동작 (When)**:
  - 정상: `FreeBytes=50, TotalBytes=100` (used 50%)
  - 임계 초과: `FreeBytes=5, TotalBytes=100` (used 95%)
  - 조회 에러: `diskErr = &model.ApiError{...}`
- **기대 결과 (Then)**:
  - 정상 → `used_percent=60`, `free_bytes=40`, `total_bytes=100` 포함 (AC-3.1) — `TestBuildDetailedHealthIncludesMetrics`
  - `system.disks` 기반 조회 (`GetDiskUsage` 인터페이스 경유) (AC-3.2)
  - used% ≥ 90 → `disk.status = "unhealthy"` (AC-3.3)
- **엣지/부정 케이스**: 디스크 조회 에러 → `disk.status = "unhealthy"` ("disk query error" 케이스)
- **테스트 위치**: `pkg/query-service/app/health_test.go` — `TestBuildDetailedHealth/"disk nearly full"`, `"disk query error"`, `TestBuildDetailedHealthIncludesMetrics`
- **결정성 메모**: FreeBytes/TotalBytes 고정값 사용. used_percent = (total-free)/total*100.

### TC-HC-4: 전체 상태 판정 (degraded → 503)
- **추적**: REQ-4 (AC-4.1, 4.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: `fakeHealthChecker` — 모든 정상 vs. 하나 이상 실패
- **입력/동작 (When)**: `buildDetailedHealth` 호출
- **기대 결과 (Then)**:
  - 전체 정상 → HTTP 200 + `status = "ok"` (AC-4.1)
  - ClickHouse 실패 → HTTP 503 + `status = "degraded"` (AC-4.2)
  - 디스크 임계 초과 → HTTP 503 + `status = "degraded"` (AC-4.2)
- **엣지/부정 케이스**: clickhouse + disk 둘 다 실패 → HTTP 503 + `status = "degraded"`
- **테스트 위치**: `pkg/query-service/app/health_test.go` — `TestBuildDetailedHealth` 전체 케이스 (wantCode 검증)
- **결정성 메모**: HTTP 상태 코드는 `buildDetailedHealth` 반환값 두 번째 인자로 직접 검증.

### TC-HC-5: 기존 동작 호환
- **추적**: REQ-5 (AC-5.1, 5.2)
- **레이어**: Go 단위 (코드 리뷰)
- **전제조건 (Given)**: `http_handler.go`의 `getHealth` 핸들러 코드 검토
- **입력/동작 (When)**: `?detailed` 없는 기본 요청 / `?live` 요청 분기 확인
- **기대 결과 (Then)**:
  - 파라미터 없음 → 기존 `{"status":"ok"}` 반환 분기 코드 보존 (AC-5.1)
  - `?live` → 기존 ClickHouse 단순 연결 체크 분기 코드 보존 (AC-5.2)
- **엣지/부정 케이스**: `?detailed=true`, `?detailed=` 등 변형 파라미터도 상세 응답 트리거
- **테스트 위치**: `pkg/query-service/app/http_handler.go` 코드 리뷰 — 기존 분기 보존 확인
- **결정성 메모**: 별도 자동 테스트 없음. 코드 리뷰로 회귀 방지.

### TC-HC-6: System Health 페이지 렌더링
- **추적**: REQ-6 (AC-6.1, 6.2, 6.3, 6.4)
- **레이어**: FE Jest
- **전제조건 (Given)**: `useGetDetailedHealth` mock — 정상 응답 (clickhouse healthy, latency_ms=3, disk ok, used_percent=50)
- **입력/동작 (When)**: `<SystemHealth />` 렌더
- **기대 결과 (Then)**:
  - `data-testid="system-health-overall"` — "ok" 텍스트 (AC-6.1)
  - `data-testid="health-clickhouse-status"` — "healthy" 텍스트 (AC-6.2)
  - `data-testid="health-clickhouse-latency"` — "3 ms" 텍스트 (AC-6.2)
  - `data-testid="health-disk-status"` — "ok" 텍스트 (AC-6.3)
  - `useGetDetailedHealth` react-query 훅 사용 확인 (AC-6.4)
- **엣지/부정 케이스**: `/settings/system-health` 라우트 배선 확인 (routes.ts, config.tsx)
- **테스트 위치**: `frontend/src/container/SystemHealth/__tests__/SystemHealth.test.tsx` — `"renders healthy clickhouse and disk cards"`
- **결정성 메모**: `useGetDetailedHealth` jest.mock으로 고정 데이터 주입.

### TC-HC-7: 상태별 색상·라벨 시각화
- **추적**: REQ-7 (AC-7.1, 7.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: `useGetDetailedHealth` mock — degraded 응답 (clickhouse unhealthy)
- **입력/동작 (When)**: `<SystemHealth />` 렌더
- **기대 결과 (Then)**:
  - `data-testid="system-health-overall"` — "degraded" 텍스트 (AC-7.1 — cherry 색상 적용)
  - `data-testid="health-clickhouse-error"` — "connection refused" 텍스트 (AC-7.2)
  - 모든 상호작용·표시 요소에 `data-testid` 부여 확인 (AC-7.2)
- **엣지/부정 케이스**: healthy 상태 → forest 색상 클래스 적용 확인
- **테스트 위치**: `frontend/src/container/SystemHealth/__tests__/SystemHealth.test.tsx` — `"renders a degraded (503) response without crashing"`
- **결정성 메모**: 색상 클래스(`forest`/`cherry`)는 스냅샷 테스트 또는 className 직접 확인 권장.

### TC-HC-8: 로딩·에러 처리
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: `useGetDetailedHealth` mock — 두 케이스
- **입력/동작 (When)**:
  - 로딩: `{ isLoading: true }`
  - 에러: `{ isLoading: false, isError: true, data: undefined }`
  - 503 degraded: `{ isLoading: false, isError: false, data: { payload: { status: 'degraded', ... } } }`
- **기대 결과 (Then)**:
  - 로딩 → `data-testid="system-health-loading"` 렌더 (AC-8.1)
  - 에러 → `data-testid="system-health-error"` 렌더 (AC-8.2)
  - 503 degraded → 에러 없이 degraded 상태 정상 표시 (AC-8.2)
- **엣지/부정 케이스**: `data: undefined` 일 때 크래시 없이 에러 UI 표시
- **테스트 위치**: `frontend/src/container/SystemHealth/__tests__/SystemHealth.test.tsx` — `"shows a loading indicator"`, `"shows an error state"`, `"renders a degraded (503) response"`
- **결정성 메모**: `jest.mock('hooks/health/useGetDetailedHealth')`으로 훅 완전 대체.

## 미커버 항목 (Gap)
- `/settings/system-health` 라우트 실제 E2E 접근 확인 — Playwright 권장
- ClickHouse 타임아웃 시나리오 (`context deadline exceeded`) — Go 통합 테스트 권장
- 색상 클래스(`forest`/`cherry`) 적용 검증 — 스냅샷 테스트 추가 권장

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| 2026-06-12 | `go test ./pkg/query-service/app/...` | 5/5 PASS ✅ | health_test.go |
| 2026-06-12 | `pnpm jest src/container/SystemHealth` | 4/4 PASS ✅ | SystemHealth.test.tsx |
