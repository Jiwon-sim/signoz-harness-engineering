# Design — APM / Services (애플리케이션 성능 모니터링)

> requirements.md의 REQ-* 구현 설계. 상태: Approved · 작성일: 2026-06-13
> 참고(실측): `frontend/src/pages/Services/index.tsx`, `frontend/src/container/ServiceApplication/`, `pkg/query-service/app/http_handler.go`

## 1. 개요
APM/Services는 ClickHouse 트레이스 테이블에서 스팬을 집계해 RED 메트릭을 계산하는
읽기 전용 기능이다. 백엔드가 서비스별 메트릭을 집계하고,
프론트엔드가 `ServiceApplication` 컨테이너에서 서비스 목록·상세·트레이스를 탭으로 제공한다.

## 2. 아키텍처
- 영향 레이어: [x] Frontend [x] Backend(pkg) [ ] EE [x] ClickHouse(읽기 전용)
- 배치:
  - `frontend/src/pages/Services/index.tsx` — 진입점 (ServicesApplication 위임)
  - `frontend/src/container/ServiceApplication/index.tsx` — 서비스 목록 + 상세 탭
  - `frontend/src/container/ServiceApplication/ServiceMetrics/` — 메트릭 차트
  - `frontend/src/container/ServiceApplication/ServiceTraces/` — 서비스별 트레이스
  - `pkg/query-service/app/http_handler.go` — APM 라우트 핸들러
  - `pkg/modules/services/` — 서비스 메트릭 집계 로직
  - `pkg/modules/apdex/` — Apdex 점수 계산

- 흐름:
```
/services 진입
   └ ServicesApplication
       ├ POST /api/v2/services → 서비스 목록 (RED 메트릭 포함)
       └ 서비스 클릭 → /services/{serviceName}
           └ ServiceApplication (탭)
               ├ Metrics 탭 → POST /api/v3/query_range (시계열 RED 메트릭)
               ├ Operations 탭 → POST /api/v2/service/top_operations
               │                  POST /api/v2/service/entry_point_operations
               └ Traces 탭 → POST /api/v3/query_range (서비스 필터 적용)
```

## 3. 백엔드 API (REQ-1, 3, 4, 6, 7)

| 엔드포인트 | 메서드 | 핸들러 | 권한 |
|-----------|--------|--------|------|
| `/api/v2/services` | POST | `Services.Get` | ViewAccess |
| `/api/v1/services/list` | GET | `getServicesList` | ViewAccess |
| `/api/v2/service/top_operations` | POST | `Services.GetTopOperations` | ViewAccess |
| `/api/v2/service/entry_point_operations` | POST | `Services.GetEntryPointOperations` | ViewAccess |
| `/api/v1/service/top_level_operations` | GET | `getServicesTopLevelOps` | ViewAccess |
| `/api/v3/query_range` | POST | `QueryRangeV3` | ViewAccess |

### 데이터 집계 방식
- ClickHouse 트레이스 테이블에서 `service.name` 기준 스팬 집계
- rate = 초당 스팬 수, error_rate = status_code=2 비율, duration = p99(durationNano)
- Apdex = (Satisfied + Tolerating/2) / Total (T값 기준)

## 4. 프론트엔드 설계 (REQ-1~8)

### 서비스 목록
```typescript
// ServicesApplication → POST /api/v2/services
interface ServiceData {
  serviceName: string;
  p99: number;          // p99 latency (ms)
  errorRate: number;    // 에러율 (%)
  callRate: number;     // 초당 요청 수
  numCalls: number;     // 총 요청 수
  apdex: number;        // Apdex 점수
}
```

### 탭 구조 (서비스 상세)
```
ServiceApplication
├ Metrics  → ServiceMetrics (시계열 차트 3종: rate / error / duration)
├ Operations → top_operations + entry_point_operations 테이블
└ Traces   → TracesExplorer 필터 (service.name 고정)
```

### 환경 필터 (REQ-2)
- `deployment.environment` 속성으로 필터링
- 선택값 → URL 파라미터(`env`) 유지

### 컬럼 설정
- `Columns/` 디렉토리 — 서비스 목록 표시 컬럼 커스터마이징

## 5. 데이터 모델

```go
// pkg/modules/services
type ServiceItem struct {
    ServiceName string  `json:"serviceName"`
    Percentile99 float64 `json:"p99"`
    ErrorRate    float64 `json:"errorRate"`
    CallRate     float64 `json:"callRate"`
    NumCalls     uint64  `json:"numCalls"`
    Apdex        float64 `json:"apdex"`
}
```

## 6. 에러 처리
- 서비스 없음 → 온보딩 화면 표시 (REQ-1, AC-1.3)
- ClickHouse 쿼리 실패 → 에러 메시지 + 재시도 (REQ-8, AC-8.2)
- 환경 필터 적용 시 서비스 없음 → 빈 상태 UI

## 7. 테스트 전략
| REQ | 레이어 | 검증 방법 |
|-----|--------|-----------|
| REQ-1 | FE Jest | MSW mock → 서비스 테이블 렌더 (rate, error, p99, apdex) |
| REQ-3 | FE Jest | 서비스 클릭 → Metrics 탭 차트 렌더 |
| REQ-4 | Go 단위 | top_operations 핸들러 → 응답 형식 검증 |
| REQ-7 | Go 단위 | Apdex 계산 로직 단위 테스트 |

## 8. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|--------------|
| §3 (백엔드 API) | REQ-1, REQ-3, REQ-4, REQ-6, REQ-7 |
| §4 (FE 목록·탭) | REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-8 |
| §4 (Apdex) | REQ-7 |
