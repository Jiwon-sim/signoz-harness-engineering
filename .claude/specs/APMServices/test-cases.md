# Test Cases — APM / Services (애플리케이션 성능 모니터링)

> 출처 스펙: `.claude/specs/APMServices/requirements.md`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-APM-1 | REQ-1 / AC-1.1, 1.2, 1.3 | FE Jest | ✅ | [ ] |
| TC-APM-2 | REQ-2 / AC-2.1, 2.2 | FE Jest | ✅ | [ ] |
| TC-APM-3 | REQ-3 / AC-3.1, 3.2, 3.3 | FE Jest | ✅ | [ ] |
| TC-APM-4 | REQ-4 / AC-4.1, 4.2 | Go 단위 + FE Jest | ✅ | [ ] |
| TC-APM-5 | REQ-5 / AC-5.1, 5.2 | FE Jest | ✅ | [ ] |
| TC-APM-6 | REQ-6 / AC-6.1 | Go 단위 | ✅ | [ ] |
| TC-APM-7 | REQ-7 / AC-7.1, 7.2 | Go 단위 + FE Jest | ✅ | [ ] |
| TC-APM-8 | REQ-8 / AC-8.1, 8.2 | FE Jest | ✅ | [ ] |

## 테스트 케이스 상세

### TC-APM-1: 서비스 목록 조회
- **추적**: REQ-1 (AC-1.1, 1.2, 1.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `POST /api/v2/services` 응답 목킹 (서비스 3건)
- **입력/동작 (When)**: `/services` 페이지 진입
- **기대 결과 (Then)**:
  - 서비스명·rate·error rate·p99·Apdex 컬럼 렌더링 (AC-1.1)
  - 시간 범위 선택기 표시 (AC-1.2)
- **엣지/부정 케이스**: 서비스 없음 → 온보딩 안내 UI 표시 (AC-1.3)
- **테스트 위치(예정)**: `frontend/src/pages/Services/Metrics.test.tsx`
- **결정성 메모**: MSW 고정 응답. Apdex 값은 0.0~1.0 범위 고정.

### TC-APM-2: 서비스 환경 필터
- **추적**: REQ-2 (AC-2.1, 2.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 서비스 목록 표시 중, prod/staging 환경 존재
- **입력/동작 (When)**: 환경 드롭다운에서 "production" 선택
- **기대 결과 (Then)**:
  - production 서비스만 목록에 표시 (AC-2.1)
  - URL `?env=production` 파라미터 추가 (AC-2.2)
- **엣지/부정 케이스**: 전체(All) 선택 → 모든 환경 서비스 표시
- **테스트 위치(예정)**: `frontend/src/pages/Services/Metrics.test.tsx`
- **결정성 메모**: react-router URL 파라미터 목킹.

### TC-APM-3: 서비스 상세 메트릭
- **추적**: REQ-3 (AC-3.1, 3.2, 3.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `/api/v3/query_range` 시계열 응답 목킹
- **입력/동작 (When)**: 서비스 "frontend" 클릭 → Metrics 탭
- **기대 결과 (Then)**:
  - Rate / Error Rate / Duration 시계열 차트 3개 렌더링 (AC-3.1)
- **엣지/부정 케이스**:
  - 시간 범위 변경 → 차트 갱신 (AC-3.2)
  - `/api/v3/query_range` 호출 확인 (AC-3.3)
- **테스트 위치(예정)**: `frontend/src/container/ServiceApplication/ServiceMetrics/__tests__/` (신규)
- **결정성 메모**: 시계열 데이터 포인트 고정 목킹.

### TC-APM-4: 핵심 작업 목록
- **추적**: REQ-4 (AC-4.1, 4.2)
- **레이어**: Go 단위 + FE Jest
- **전제조건 (Given)**: Reader mock — top_operations 3건 반환
- **입력/동작 (When)**: Operations 탭 진입, `POST /api/v2/service/top_operations`
- **기대 결과 (Then)**:
  - 작업명·호출 수·에러율·p99 latency 테이블 렌더링 (AC-4.1)
- **엣지/부정 케이스**: 작업 클릭 → TracesExplorer로 해당 작업 필터 이동 (AC-4.2)
- **테스트 위치(예정)**: `pkg/query-service/app/apm_handler_test.go` (신규), `ServiceApplication/__tests__/`
- **결정성 메모**: ClickHouse 집계 mock.

### TC-APM-5: 서비스별 트레이스
- **추적**: REQ-5 (AC-5.1, 5.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 서비스 필터 적용 트레이스 응답 목킹
- **입력/동작 (When)**: Traces 탭 진입
- **기대 결과 (Then)**:
  - service.name 필터가 자동 적용된 트레이스 목록 표시 (AC-5.1)
- **엣지/부정 케이스**: traceId 클릭 → `/trace/{traceId}` 이동 (AC-5.2)
- **테스트 위치(예정)**: `frontend/src/container/ServiceApplication/ServiceTraces/__tests__/` (신규)
- **결정성 메모**: service.name 필터 자동 주입 확인.

### TC-APM-6: 진입점 작업 조회
- **추적**: REQ-6 (AC-6.1)
- **레이어**: Go 단위
- **전제조건 (Given)**: Reader mock — entry_point_operations 2건 반환
- **입력/동작 (When)**: `POST /api/v2/service/entry_point_operations`
- **기대 결과 (Then)**: 진입점 작업 목록 응답 반환, HTTP 200
- **엣지/부정 케이스**: 진입점 없음 → 빈 배열 200 응답
- **테스트 위치(예정)**: `pkg/query-service/app/apm_handler_test.go` (신규)
- **결정성 메모**: ClickHouse mock.

### TC-APM-7: Apdex 점수
- **추적**: REQ-7 (AC-7.1, 7.2)
- **레이어**: Go 단위 + FE Jest
- **전제조건 (Given)**: T값=500ms 설정, 응답 시간 분포 데이터
- **입력/동작 (When)**: 서비스 목록 조회 (`POST /api/v2/services`)
- **기대 결과 (Then)**: Apdex 점수(0.0~1.0) 컬럼에 표시 (AC-7.1)
- **엣지/부정 케이스**:
  - T값 변경 → Apdex 점수 재계산 (AC-7.2)
  - 모든 요청 T값 이내 → Apdex = 1.0
  - 모든 요청 4T 초과 → Apdex = 0.0
- **테스트 위치(예정)**: `pkg/modules/apdex/apdex_test.go` (신규), `Services/Metrics.test.tsx`
- **결정성 메모**: 경계값 테스트 (T=500ms, 응답=499ms/501ms/2001ms).

### TC-APM-8: 로딩 및 에러 처리
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 API 지연/500 에러 설정
- **입력/동작 (When)**: Services 페이지 진입
- **기대 결과 (Then)**:
  - 로딩 중 스켈레톤/스피너 UI 표시 (AC-8.1)
- **엣지/부정 케이스**: 500 에러 → 에러 메시지 + 재시도 버튼 (AC-8.2)
- **테스트 위치(예정)**: `frontend/src/pages/Services/Metrics.test.tsx`
- **결정성 메모**: MSW 에러 핸들러 주입.

## 미커버 항목 (Gap)
- 서비스 의존성 맵 (Service Map) — 범위 밖
- 50개 이상 서비스 목록 렌더링 성능 — 부하 테스트 별도 필요

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| - | `pnpm jest src/pages/Services` | - | 미실행 |
| - | `go test ./pkg/modules/apdex/... ./pkg/modules/services/...` | - | 미실행 |
