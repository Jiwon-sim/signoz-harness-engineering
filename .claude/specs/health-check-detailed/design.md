# Design — health-check-detailed (상세 헬스체크)

> requirements.md 의 REQ-* 구현 설계. 상태: Approved(자동 진행) · 작성일: 2026-06-11
> 참고(실측): `pkg/query-service/app/http_handler.go`(getHealth, `reader interfaces.Reader`), `clickhouseReader/reader.go`(CheckClickHouse, GetCountOfThings), `pkg/query-service/healthcheck`.

## 1. 개요
기존 `getHealth` 핸들러에 `?detailed` 분기를 추가한다. 분기 시 ① ClickHouse 연결+지연 ② 디스크 용량을
조회해 구조화된 JSON 으로 응답한다. 기존 기본/`?live` 동작은 그대로 둔다(REQ-5). 디스크 조회는
`interfaces.Reader` 에 메서드를 추가해 ClickHouse `system.disks` 를 읽는다.

## 2. 아키텍처
- 영향 레이어: [ ] Frontend  [x] Backend(pkg)  [ ] EE  [x] ClickHouse(읽기 전용)
- 배치:
  - `pkg/query-service/model/`(또는 healthcheck): 응답/디스크 타입
  - `pkg/query-service/interfaces/`: Reader 인터페이스에 `GetDiskUsage` 추가
  - `pkg/query-service/app/clickhouseReader/reader.go`: `GetDiskUsage` 구현
  - `pkg/query-service/app/http_handler.go`: `getHealth` 확장
- 흐름:
```
GET /api/v1/health?detailed
   └ getHealth()
       ├ CheckClickHouse(ctx) + 지연 측정  → clickhouse 체크
       ├ GetDiskUsage(ctx) (system.disks)  → disk 체크 (used% ≥ 90 → unhealthy)
       └ 조립 → 전체 status 판정 → 200(ok) / 503(degraded)
```

## 3. 데이터 모델 / 응답 스키마 (REQ-1,2,3,4)
```go
// pkg/query-service/model/health.go (신규)
type CheckResult struct {
    Status  string  `json:"status"`            // "healthy" | "unhealthy" | "ok"
    Error   string  `json:"error,omitempty"`
    // clickhouse
    LatencyMs *int64 `json:"latency_ms,omitempty"`
    // disk
    FreeBytes   *uint64  `json:"free_bytes,omitempty"`
    TotalBytes  *uint64  `json:"total_bytes,omitempty"`
    UsedPercent *float64 `json:"used_percent,omitempty"`
}
type DetailedHealth struct {
    Status string                 `json:"status"`  // "ok" | "degraded"
    Checks map[string]CheckResult `json:"checks"`
}
type DiskInfo struct { Name string; FreeBytes uint64; TotalBytes uint64 }
```
응답 예:
```json
// 200
{ "status":"ok", "checks":{
    "clickhouse":{"status":"healthy","latency_ms":3},
    "disk":{"status":"ok","free_bytes":128849018880,"total_bytes":256000000000,"used_percent":49.7}}}
// 503
{ "status":"degraded", "checks":{
    "clickhouse":{"status":"unhealthy","error":"dial tcp ... refused"}, ...}}
```

## 4. API / 인터페이스 (REQ-1,5)
- 엔드포인트: 기존 `GET /api/v1/health` 유지. **쿼리 파라미터 `?detailed` 추가**.
  - 없음 → 기존 `{"status":"ok"}` (REQ-5).
  - `?live` → 기존 ClickHouse 연결 체크 (REQ-5).
  - `?detailed` → 상세 응답.
- Reader 인터페이스 확장:
```go
// pkg/query-service/interfaces/interface.go
GetDiskUsage(ctx context.Context) ([]model.DiskInfo, error)
```
  구현(`ClickHouseReader.GetDiskUsage`): `SELECT name, free_space, total_space FROM system.disks`.
- 로깅: `slog.InfoContext(ctx, "health_check_detailed", slog.String("status", status))` (snake_case). 에러는 `pkg/errors`.

## 5. 주요 흐름 / 로직
1. `?detailed` 감지 → `DetailedHealth{Checks: map}` 구성.
2. **clickhouse 체크**: `start:=now; err:=CheckClickHouse(ctx); latency:=since(start)`. err 없으면 healthy+latency, 있으면 unhealthy+error.
3. **disk 체크**: `GetDiskUsage(ctx)` → 디스크별 used%=（total-free)/total*100. 최대 used% 사용. ≥90 → unhealthy, 아니면 ok.
4. **전체 판정**: 모든 체크 healthy/ok → status="ok", HTTP 200. 하나라도 unhealthy → status="degraded", HTTP 503.
5. ClickHouse 쿼리에는 컨텍스트 타임아웃 적용(무한 대기 방지, 비기능).

## 6. 에러 처리 · 엣지 케이스
- ClickHouse 끊김 → clickhouse unhealthy, disk 조회도 실패 가능 → disk unhealthy(error). 전체 degraded.
- `system.disks` 빈 결과 → disk 체크 unknown 처리(보수적으로 unhealthy 또는 생략 + 사유).
- 타임아웃 → 해당 체크 unhealthy(error="timeout").

## 7. 설계 결정 · 대안 (ADR-lite)
| 결정 | 대안 | 선택 이유 |
|------|------|-----------|
| `?detailed` 파라미터 | 새 엔드포인트 `/health/detailed` | 기존 라우트 재사용·호환(REQ-5), 라우팅 변경 최소 |
| Reader 인터페이스에 GetDiskUsage | http_handler 에서 직접 ch 쿼리 | reader 추상화 준수([[database]]), 테스트 시 mock 용이 |
| 디스크는 ClickHouse system.disks | OS 디스크(syscall) | "연동 DB의 용량" 요구에 부합, 크로스플랫폼 이슈 없음 |
| used% ≥ 90 → unhealthy | 설정화 | 1차 구현은 상수, 후속 설정화 여지 |

## 8. 테스트 전략 (이 기능)
| REQ | 레이어 | 검증 |
|-----|--------|------|
| REQ-1 | Go 단위 | `?detailed` 응답에 status+checks(clickhouse,disk) 존재 |
| REQ-2 | Go 단위 | mock CheckClickHouse 정상/에러 → healthy/unhealthy |
| REQ-3 | Go 단위 | mock GetDiskUsage → used% 계산·임계 판정 |
| REQ-4 | Go 단위 | 한 체크 실패 시 status=degraded + HTTP 503 |
| REQ-5 | Go 단위 | 파라미터 없음/`?live` 기존 동작 유지 |
- 방법: `interfaces.Reader` mock + `httptest` 로 getHealth 호출, 응답코드·JSON 단언.

## 9. Frontend 설계 (REQ-6, 7, 8)
- 영향 레이어: [x] Frontend. `?detailed` 응답을 Settings 하위 페이지에 시각화.
- **라우트**: `/settings/system-health` — `constants/routes.ts` 에 `SYSTEM_HEALTH` 추가 + 라우트 컴포넌트 매핑 + Settings 사이드바 진입점 등록.
- **API**: `src/api/health/getDetailedHealth.ts` — `axios.get('/health?detailed')`. 기존 v1 수기 패턴(`api/disks/getDisks.ts`) 준수. (generated 엔 v2 프로브만 있어 재사용 불가)
- **훅**: `src/hooks/health/useGetDetailedHealth.ts` — react-query `useQuery` 로 감쌈 (AGENTS.md: API 는 react-query).
- **타입**: `src/types/api/health/getDetailedHealth.ts` — 백엔드 `DetailedHealth`/`CheckResult` 미러.
- **컴포넌트**: `src/container/SystemHealth/` — 페이지 컨테이너 1개 + ClickHouse/Disk 카드 분리(파일당 1컴포넌트, 300 LOC↓, barrel 금지).
- **시각화**: healthy/ok = 긍정색, unhealthy/degraded = 경고색. 표시 요소에 `data-testid`.
- **로딩/에러(REQ-8)**: react-query `isLoading`/`isError`. ⚠️ degraded 는 **HTTP 503 + JSON 본문** → axios 가 에러로 던지므로 `error.response.data` 에서 본문을 읽어 상태를 표시(503 을 "실패"가 아니라 "degraded 상태"로 처리).
- 흐름:
```
/settings/system-health 진입
   └ useGetDetailedHealth() (react-query)
       └ GET /api/v1/health?detailed
           ├ 200 → data 그대로 표시
           └ 503 → error.response.data(degraded 본문) 표시
   → ClickHouse 카드 · Disk 카드 렌더 (상태별 색상)
```

## 10. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|----------------|
| §3,§4 | REQ-1, REQ-2, REQ-3 |
| §5 | REQ-1~5 |
| §4 | REQ-5 |
| §9 (FE) | REQ-6, REQ-7, REQ-8 |
