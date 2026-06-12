# Tasks — health-check-detailed (상세 헬스체크)

> design.md 를 실행 작업으로 분해. 상태: 진행 중. 표기: [ ] 대기 [~] 진행 [x] 완료

## TASK-1: 모델 + Reader 인터페이스 확장 + 디스크 조회 (Backend)
- **충족**: REQ-2, REQ-3
- **변경 대상(≤5)**:
  - `pkg/query-service/model/health.go` (신규: CheckResult, DetailedHealth, DiskInfo)
  - `pkg/query-service/interfaces/interface.go` (Reader 에 `GetDiskUsage` 추가)
  - `pkg/query-service/app/clickhouseReader/reader.go` (`GetDiskUsage` 구현: system.disks)
  - (있으면) Reader mock 재생성/수정
- **세부**:
  - [x] 1.1 응답/디스크 타입 정의.
  - [x] 1.2 인터페이스에 `GetDiskUsage(ctx) ([]model.DiskInfo, *model.ApiError)`.
  - [x] 1.3 ClickHouse `SELECT name, free_space, total_space FROM system.disks` 구현.
  - [x] 1.4 mock 불필요 확인 (Reader mock 없음 → 동기화 대상 없음).
- **검증**: `go build ./pkg/query-service/...` ✅ (exit 0)

## TASK-2: getHealth 핸들러 확장 (Backend)
- **충족**: REQ-1, REQ-4, REQ-5
- **변경 대상**: `pkg/query-service/app/http_handler.go` (getHealth)
- **세부**:
  - [x] 2.1 `?detailed` 분기. 없음/`?live` 는 기존 유지(REQ-5).
  - [x] 2.2 clickhouse 체크(지연 측정) + disk 체크(used% 임계 90).
  - [x] 2.3 전체 판정 → 200/503.
- **검증**: `go build ./...` ✅ (exit 0)

## TASK-3: 단위 테스트 (Backend)
- **충족**: REQ-1~5 전체
- **변경 대상**: `pkg/query-service/app/health_test.go` (신규) — Reader mock + httptest
- **세부**:
  - [x] 3.1 정상: 200 + status ok + checks 존재 (all healthy).
  - [x] 3.2 ClickHouse 실패 → degraded + 503 (clickhouse down).
  - [x] 3.3 디스크 임계 초과 → disk unhealthy + degraded (disk nearly full / query error).
  - [x] 3.4 메트릭 포함 검증 (latency_ms, used_percent, free_bytes).
- **검증**: `go test ./pkg/query-service/app/...` ✅ (5/5 PASS), `go vet` ✅

## TASK-4: API + 훅 + 타입 (Frontend 데이터)
- **충족**: REQ-6 (AC-6.4)
- **변경 대상(≤5, 신규)**:
  - `frontend/src/types/api/health/getDetailedHealth.ts` (DetailedHealth/CheckResult 미러)
  - `frontend/src/api/health/getDetailedHealth.ts` (axios.get('/health?detailed'), getDisks 패턴)
  - `frontend/src/hooks/health/useGetDetailedHealth.ts` (react-query useQuery)
- **세부**:
  - [x] 4.1 응답 타입 정의 (status, checks.clickhouse/disk).
  - [x] 4.2 수기 API 함수 — 200/503 본문 모두 파싱.
  - [x] 4.3 react-query 훅.
- **검증**: `pnpm tsgo --noEmit` ✅ (0 errors)

## TASK-5: System Health 페이지 + 배선 + 테스트 (Frontend UI)
- **충족**: REQ-6, REQ-7, REQ-8
- **변경 대상(≤5)**:
  - `frontend/src/container/SystemHealth/SystemHealth.tsx` (페이지 컨테이너, 신규)
  - `frontend/src/container/SystemHealth/HealthCard.tsx` (상태 카드, 신규)
  - `frontend/src/constants/routes.ts` (SYSTEM_HEALTH 라우트)
  - 라우트 매핑 + Settings 사이드바 진입점
  - `frontend/src/container/SystemHealth/__tests__/SystemHealth.test.tsx` (Jest + MSW)
- **세부**:
  - [x] 5.1 페이지: 훅 호출 → ClickHouse/Disk 카드 렌더 (data-testid).
  - [x] 5.2 상태별 색상·라벨 (Badge forest/cherry).
  - [x] 5.3 로딩/에러/503 처리.
  - [x] 5.4 라우트·사이드바 배선 (+ permission/index.ts).
  - [x] 5.5 테스트: 정상/degraded(503)/로딩/에러 4케이스.
- **검증**: `tsgo` ✅0 · `oxlint`(=lint:js) ✅0 · `jest` ✅4/4 · `build` ✅(12592 modules)

## Phase 계획
| Phase | 태스크 | 게이트 |
|-------|--------|--------|
| 1 | TASK-1 | go build ✅ |
| 2 | TASK-2 | go build ✅ |
| 3 | TASK-3 | go test 통과 ✅ |
| 4 | TASK-4 | tsgo |
| 5 | TASK-5 | tsgo/lint/oxlint/build/jest |

## 완료 정의 (DoD)
- [x] REQ-1~5 (Backend) 구현·검증
- [x] REQ-6~8 (Frontend) 구현·검증
- [x] `go build` + `go test` + `go vet` (Backend)
- [x] `pnpm tsgo/oxlint/build/jest` (Frontend) — 전부 통과
- [x] 백엔드 실제 실행 `/api/v1/health?detailed` 응답 확인
- [ ] 프론트 `/settings/system-health` 화면 동작 확인 (dev server 실행 시 — 선택)
- [x] 추적표 최신화 (REQ-6~8 추가)
