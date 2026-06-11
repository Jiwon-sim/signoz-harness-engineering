# Test Cases — Dashboards

> 기능 영역: Dashboards ([feature-catalog.md](../feature-catalog.md) #8)
> 라우트: `ALL_DASHBOARD`, `DASHBOARD`, `DASHBOARD_WIDGET`, `PUBLIC_DASHBOARD`
> 백엔드: `pkg/modules/dashboard` + `ee/modules/dashboard` (에디션 양쪽)

## 요약 추적표
| TC ID | 대상 동작 | 레이어 | 자동화 | 상태 |
|-------|-----------|--------|--------|------|
| TC-DSH-1 | 대시보드 목록·검색 | E2E / 통합 | ⬜ | [ ] |
| TC-DSH-2 | 대시보드 생성 | E2E / 통합 | ⬜ | [ ] |
| TC-DSH-3 | 패널(위젯) 추가 | E2E | ⬜ | [ ] |
| TC-DSH-4 | 패널 복제 | E2E / FE 단위 | ⬜ | [ ] |
| TC-DSH-5 | 대시보드 변수 적용 | E2E | ⬜ | [ ] |
| TC-DSH-6 | 퍼블릭 대시보드 공유 | E2E / 통합 | ⬜ | [ ] |

## 상세

### TC-DSH-1: 대시보드 목록
- **When**: `/dashboard`(ALL_DASHBOARD) 진입 + 이름 검색.
- **Then**: 대시보드 목록이 표시되고 검색어로 필터링된다.
- **엣지**: 0개 → 빈 상태. 권한별 표시 범위(확인 필요).

### TC-DSH-2: 대시보드 생성
- **When**: 'New Dashboard' → 이름/설명 입력 후 생성.
- **Then**: 새 대시보드가 생성되어 편집 화면으로 이동한다.
- **통합**: 생성 API → 메타스토어 저장(Postgres·SQLite 양쪽).

### TC-DSH-3: 패널 추가
- **Given**: 대시보드 편집 화면.
- **When**: 'Add Panel' → 쿼리·시각화 타입 지정 후 저장(`DASHBOARD_WIDGET`).
- **Then**: 패널이 그리드에 추가되고 데이터가 렌더된다.
- **엣지**: 빈 쿼리 → 저장 차단/경고.

### TC-DSH-4: 패널 복제 (예시 시나리오)
- **Given**: 패널이 1개 이상 있는 대시보드.
- **When**: 패널의 'Duplicate' 실행.
- **Then**:
  - 동일 쿼리·시각화 타입의 새 패널이 같은 대시보드에 추가된다.
  - 복제 패널 제목은 원본과 구분된다(예: "(copy)").
  - 원본 패널은 변경되지 않는다.
- **FE 단위**: 복제 콜백이 패널 설정을 깊은 복사하는지(참조 공유 금지) 검증.
- **엣지**: 그리드 레이아웃 위치 충돌 시 재배치.

### TC-DSH-5: 대시보드 변수
- **Given**: 변수(예: `service`)가 정의된 대시보드.
- **When**: 변수 값을 변경.
- **Then**: 변수에 의존하는 모든 패널 쿼리가 재실행·갱신된다.
- **엣지**: 다중값/전체(All) 선택 처리.

### TC-DSH-6: 퍼블릭 대시보드
- **When**: 대시보드를 공개로 설정 후 `PUBLIC_DASHBOARD` URL 접근(비로그인).
- **Then**: 인증 없이 읽기 전용으로 표시된다.
- **엣지**: 공개 해제 시 접근 차단. 편집 동작 비노출.
- **통합**: 공개 토큰 발급·검증 경로.

## 미커버 / 확인 필요
- Dashboard vs DashboardV2(`DashboardPageV2`) 동작 차이 → 전환 시 회귀 테스트.
- EE 대시보드(`ee/modules/dashboard`) 추가 기능 → 에디션별 TC 분리.
