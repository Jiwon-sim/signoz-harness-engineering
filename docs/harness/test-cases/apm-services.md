# Test Cases — APM / Services

> 기능 영역: APM / Services ([feature-catalog.md](../feature-catalog.md) #1)
> 라우트: `APPLICATION`, `SERVICE_METRICS`, `SERVICE_TOP_LEVEL_OPERATIONS`, `SERVICE_MAP`
> 백엔드: `pkg/modules/services`, `pkg/modules/apdex`, `pkg/modules/spanpercentile`

## 요약 추적표
| TC ID | 대상 동작 | 레이어 | 자동화 | 상태 |
|-------|-----------|--------|--------|------|
| TC-APM-1 | 서비스 목록 표시 | E2E / 통합 | ⬜ | [ ] |
| TC-APM-2 | 시간 범위 변경 시 메트릭 갱신 | E2E | ⬜ | [ ] |
| TC-APM-3 | 서비스 상세(p50/p95/p99) | E2E / Go 단위 | ⬜ | [ ] |
| TC-APM-4 | 에러율·처리량 표시 | E2E | ⬜ | [ ] |
| TC-APM-5 | 서비스 맵 의존성 시각화 | E2E | ⬜ | [ ] |
| TC-APM-6 | Apdex 임계값 설정 반영 | 통합 / Go 단위 | ⬜ | [ ] |

## 상세

### TC-APM-1: 서비스 목록 표시
- **Given**: 트레이스 데이터가 수집된 상태로 로그인.
- **When**: `/services` 진입.
- **Then**: 서비스 목록이 P99 지연·에러율·처리량 컬럼과 함께 표시된다.
- **엣지**: 데이터 없음 → 빈 상태 UI. 권한 없음 → 접근 차단.
- **레이어**: E2E(Playwright) + 통합(목록 API↔ClickHouse).

### TC-APM-2: 시간 범위 변경 시 메트릭 갱신
- **Given**: 서비스 목록 화면.
- **When**: 전역 시간 선택기를 'Last 1 hour' → 'Last 24 hours'로 변경.
- **Then**: 모든 서비스 메트릭이 새 범위로 재질의·갱신된다.
- **결정성**: 고정 시드 데이터 + 고정 시계.

### TC-APM-3: 서비스 상세(지연 백분위)
- **Given**: 서비스 1개 선택.
- **When**: `/services/:servicename` (SERVICE_METRICS) 진입.
- **Then**: p50/p95/p99 지연 시계열이 표시된다.
- **Go 단위**: `spanpercentile` 백분위 계산 로직을 테이블 드리븐으로 검증.

### TC-APM-4: 에러율·처리량
- **When**: 서비스 상세에서 에러율/처리량 패널 확인.
- **Then**: 선택 범위의 error rate(%)·throughput(req/s)이 시계열로 표시된다.
- **엣지**: 0 요청 구간 → 0 또는 공백 처리(나눗셈 0 방지).

### TC-APM-5: 서비스 맵
- **When**: `/service-map` 진입.
- **Then**: 서비스 간 호출 의존성이 노드·엣지 그래프로 표시되고, 엣지에 호출량/지연이 반영된다.
- **엣지**: 단일 서비스만 있을 때 자기 노드만 표시.

### TC-APM-6: Apdex 임계값
- **Given**: 특정 서비스의 Apdex 임계값(T) 설정.
- **When**: 임계값을 변경·저장.
- **Then**: Apdex 점수가 새 T 기준으로 재계산되어 표시된다.
- **통합/Go 단위**: `modules/apdex` 저장→조회→점수 계산 경로.

## 미커버 / 확인 필요
- 서비스 목록 정렬·필터 세부 동작 → `/analyze-feature services`로 확정.
- Exceptions(에러 상세)와의 연계 흐름은 별도 영역(Exceptions) TC 로.
