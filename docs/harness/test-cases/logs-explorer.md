# Test Cases — Logs Explorer

> 기능 영역: Logs ([feature-catalog.md](../feature-catalog.md) #4)
> 라우트: `LOGS`, `LOGS_EXPLORER`, `LIVE_LOGS`, `LOGS_SAVE_VIEWS`, `LOGS_INDEX_FIELDS`
> 백엔드: `pkg/telemetrylogs`, `pkg/modules/fields`, `pkg/modules/savedview`, `pkg/querier`

## 요약 추적표
| TC ID | 대상 동작 | 레이어 | 자동화 | 상태 |
|-------|-----------|--------|--------|------|
| TC-LOG-1 | 로그 검색·필터 | E2E / 통합 | ⬜ | [ ] |
| TC-LOG-2 | 쿼리 빌더로 조건 추가 | E2E / FE 단위 | ⬜ | [ ] |
| TC-LOG-3 | 시간 범위 페이징 | E2E | ⬜ | [ ] |
| TC-LOG-4 | 로그 상세(속성/컨텍스트) | E2E | ⬜ | [ ] |
| TC-LOG-5 | 저장 뷰 생성·복원 | E2E / 통합 | ⬜ | [ ] |
| TC-LOG-6 | 라이브 테일 스트리밍 | E2E | ⬜ | [ ] |

## 상세

### TC-LOG-1: 로그 검색·필터
- **Given**: 로그 데이터 수집됨.
- **When**: `/logs/logs-explorer`에서 키워드/속성 필터 입력 후 실행.
- **Then**: 조건에 맞는 로그만 결과 목록에 표시된다.
- **엣지**: 결과 0건 → 빈 상태. 잘못된 쿼리 → 검증 에러 메시지.
- **통합**: 필터 → querier → ClickHouse 결과 일치.

### TC-LOG-2: 쿼리 빌더
- **When**: 쿼리 빌더에서 속성·연산자·값을 선택해 조건을 추가.
- **Then**: 조건이 쿼리로 변환되어 결과에 반영된다.
- **FE 단위**: 쿼리 빌더 컴포넌트가 조건 추가/삭제 시 올바른 쿼리 객체를 생성(`data-testid` 기반).

### TC-LOG-3: 시간 범위·페이징
- **When**: 시간 범위 변경 + 결과 하단 스크롤(다음 페이지).
- **Then**: 범위 내 로그가 시간순으로 페이징되어 로드된다.
- **결정성**: 고정 시드·고정 시계.

### TC-LOG-4: 로그 상세
- **When**: 로그 행 클릭.
- **Then**: 속성(attributes)·리소스·연관 트레이스 링크가 상세 패널에 표시된다.
- **엣지**: 트레이스 ID 없는 로그 → 트레이스 링크 비활성.

### TC-LOG-5: 저장 뷰
- **Given**: 필터·쿼리가 적용된 탐색 상태.
- **When**: 'Save View'로 이름 지정 저장 → 목록에서 재선택.
- **Then**: 저장 시점의 쿼리·컬럼 구성이 복원된다.
- **통합**: `modules/savedview` 저장→조회 라운드트립.

### TC-LOG-6: 라이브 테일
- **When**: `/logs/logs-explorer/live` 진입.
- **Then**: 신규 로그가 실시간 스트리밍으로 상단에 추가된다.
- **엣지**: 일시정지/재개 토글 동작. 연결 끊김 시 재연결.

## 미커버 / 확인 필요
- 인덱스 필드(`LOGS_INDEX_FIELDS`) 설정과 검색 성능 영향 → 구현 시 확정.
- Old vs New Logs Explorer 동작 차이 → 전환 작업 시 회귀 테스트 필요.
