# Tasks — APM / Services (애플리케이션 성능 모니터링)

> design.md를 실행 작업으로 분해. 상태: 기존 구현 문서화 완료.

## TASK-1: 백엔드 APM API (기존 구현 확인)
- **충족**: REQ-1, REQ-3, REQ-4, REQ-6, REQ-7
- **대상 파일**:
  - `pkg/query-service/app/http_handler.go` (getServices, getServicesList, getTopOperations 등)
  - `pkg/modules/services/` (서비스 메트릭 집계)
  - `pkg/modules/apdex/` (Apdex 계산)
- **세부**:
  - [x] 1.1 `POST /api/v2/services` — 서비스 목록 + RED 메트릭 + Apdex
  - [x] 1.2 `GET /api/v1/services/list` — 서비스명 목록
  - [x] 1.3 `POST /api/v2/service/top_operations` — 상위 작업
  - [x] 1.4 `POST /api/v2/service/entry_point_operations` — 진입점 작업
  - [x] 1.5 `GET /api/v1/service/top_level_operations` — 최상위 작업
- **검증 게이트**: `go build ./pkg/modules/services/... ./pkg/modules/apdex/...`

## TASK-2: 프론트엔드 APM UI (기존 구현 확인)
- **충족**: REQ-1~8
- **대상 파일**:
  - `frontend/src/pages/Services/index.tsx`
  - `frontend/src/container/ServiceApplication/index.tsx`
  - `frontend/src/container/ServiceApplication/ServiceMetrics/`
  - `frontend/src/container/ServiceApplication/ServiceTraces/`
  - `frontend/src/container/ServiceApplication/Columns/`
- **세부**:
  - [x] 2.1 서비스 목록 테이블 (rate, error rate, p99, apdex 컬럼)
  - [x] 2.2 환경 필터 + URL 파라미터 유지
  - [x] 2.3 Metrics 탭 — 시계열 차트 3종 (rate / error / duration)
  - [x] 2.4 Operations 탭 — top_operations + entry_point_operations
  - [x] 2.5 Traces 탭 — 서비스 필터 적용 트레이스 목록
  - [x] 2.6 로딩/에러/빈 상태 처리
- **검증 게이트**: `pnpm tsgo --noEmit`

## TASK-3: 테스트 커버리지 확인
- **기존 테스트**: `frontend/src/pages/Services/Metrics.test.tsx`
- **테스트 공백 (추가 필요)**:
  - [ ] 3.1 서비스 목록 테이블 렌더링 단위 테스트 (rate, error, p99, apdex)
  - [ ] 3.2 환경 필터 선택 → URL 파라미터 변경 단위 테스트
  - [ ] 3.3 Apdex 계산 Go 단위 테스트 (T값 경계 케이스)
  - [ ] 3.4 top_operations 응답 렌더링 단위 테스트
- **검증 게이트**: `pnpm jest src/pages/Services`

## 완료 정의 (DoD)
- [x] REQ-1~8 구현 확인
- [ ] 테스트 공백(3.1~3.4) 보완 시 완전한 DoD 달성
