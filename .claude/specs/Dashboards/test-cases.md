# Test Cases — Dashboards (대시보드)

> 출처 스펙: `.claude/specs/Dashboards/requirements.md`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-DB-1 | REQ-1 / AC-1.1, 1.2, 1.3 | FE Jest | ✅ | [ ] |
| TC-DB-2 | REQ-2 / AC-2.1, 2.2 | Go 단위 | ✅ | [ ] |
| TC-DB-3 | REQ-3 / AC-3.1, 3.2, 3.3 | FE Jest | ✅ | [ ] |
| TC-DB-4 | REQ-4 / AC-4.1, 4.2 | Go 단위 + FE Jest | ✅ | [ ] |
| TC-DB-5 | REQ-5 / AC-5.1, 5.2 | FE Jest | ✅ | [ ] |
| TC-DB-6 | REQ-6 / AC-6.1, 6.2 | FE Jest | ✅ | [ ] |
| TC-DB-7 | REQ-7 / AC-7.1, 7.2 | FE Jest | ✅ | [ ] |
| TC-DB-8 | REQ-8 / AC-8.1, 8.2 | FE Jest | ✅ | [ ] |
| TC-DB-9 | REQ-9 / AC-9.1, 9.2 | FE Jest | ✅ | [ ] |

## 테스트 케이스 상세

### TC-DB-1: 대시보드 목록 조회
- **추적**: REQ-1 (AC-1.1, 1.2, 1.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `GET /api/v1/dashboards` 응답 목킹 (대시보드 2건)
- **입력/동작 (When)**: `/dashboards` 페이지 진입
- **기대 결과 (Then)**:
  - 대시보드 카드 2건 렌더링 (AC-1.1)
  - 이름·태그·생성일 표시 확인
- **엣지/부정 케이스**:
  - 카드 클릭 → `/dashboards/{id}` 이동 (AC-1.2)
  - 빈 목록 → 빈 상태 UI 표시 (AC-1.3)
- **테스트 위치(예정)**: `frontend/src/pages/DashboardsListPage/__tests__/DashboardsListPage.test.tsx`
- **결정성 메모**: MSW 고정 응답.

### TC-DB-2: 대시보드 생성
- **추적**: REQ-2 (AC-2.1, 2.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: 메타스토어 mock 설정
- **입력/동작 (When)**: `POST /api/v1/dashboards` — 빈 대시보드 생성 요청
- **기대 결과 (Then)**:
  - 생성된 대시보드 ID 반환 (AC-2.1)
  - HTTP 200 반환
- **엣지/부정 케이스**: 이름 없이 생성 → 기본 제목("New Dashboard") 적용 확인
- **테스트 위치(예정)**: `pkg/modules/dashboard/handler_test.go` (신규)
- **결정성 메모**: 메타스토어 mock.

### TC-DB-3: 대시보드 상세 조회
- **추적**: REQ-3 (AC-3.1, 3.2, 3.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `GET /api/v1/dashboards/{id}` 응답 목킹 (패널 2개)
- **입력/동작 (When)**: `/dashboards/{id}` 페이지 진입
- **기대 결과 (Then)**:
  - 대시보드 타이틀·설명 헤더 표시 (AC-3.1)
  - 패널 2개가 정의된 위치에 렌더링 (AC-3.2)
- **엣지/부정 케이스**: 없는 ID → `NotFound` 컴포넌트 렌더 (AC-3.3)
- **테스트 위치(예정)**: `frontend/src/pages/DashboardPage/__tests__/DashboardPage.test.tsx` (신규)
- **결정성 메모**: useDashboardBootstrap 목킹.

### TC-DB-4: 대시보드 수정
- **추적**: REQ-4 (AC-4.1, 4.2)
- **레이어**: Go 단위 + FE Jest
- **전제조건 (Given)**: 잠금 해제 상태 대시보드, 메타스토어 mock
- **입력/동작 (When)**: 패널 제목 수정 후 저장 → `PUT /api/v1/dashboards/{id}`
- **기대 결과 (Then)**:
  - 저장 후 변경된 제목이 UI에 즉시 반영 (AC-4.1)
- **엣지/부정 케이스**: 잠긴 대시보드에 PUT 요청 → 403 반환 (AC-4.2)
- **테스트 위치(예정)**: `pkg/modules/dashboard/handler_test.go`, `DashboardPage.test.tsx`
- **결정성 메모**: 잠금 상태는 Zustand store 직접 설정.

### TC-DB-5: 대시보드 삭제
- **추적**: REQ-5 (AC-5.1, 5.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 대시보드 목록 페이지, MSW로 DELETE 응답 목킹
- **입력/동작 (When)**: 삭제 버튼 클릭
- **기대 결과 (Then)**:
  - 확인 모달 표시 (AC-5.1)
- **엣지/부정 케이스**: 확인 후 → 목록에서 해당 대시보드 제거 (AC-5.2)
- **테스트 위치(예정)**: `frontend/src/pages/DashboardsListPage/__tests__/DashboardsListPage.test.tsx`
- **결정성 메모**: 모달 confirm 버튼 클릭 시뮬레이션.

### TC-DB-6: 대시보드 잠금/해제
- **추적**: REQ-6 (AC-6.1, 6.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 잠금 해제 상태 대시보드
- **입력/동작 (When)**: Lock 버튼 클릭
- **기대 결과 (Then)**:
  - 패널 편집 버튼 비활성화 (AC-6.1)
  - 잠금 상태 즉시 UI 반영 (AC-6.2)
- **엣지/부정 케이스**: Unlock → 편집 버튼 다시 활성화
- **테스트 위치(예정)**: `frontend/src/container/DashboardContainer/__tests__/DashboardContainer.test.tsx` (신규)
- **결정성 메모**: Zustand store isLocked 상태 변경으로 검증.

### TC-DB-7: 대시보드 변수
- **추적**: REQ-7 (AC-7.1, 7.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 변수(service.name) 정의된 대시보드, MSW로 variables/query 응답 목킹
- **입력/동작 (When)**: 변수 드롭다운에서 "frontend" 선택
- **기대 결과 (Then)**:
  - 드롭다운에 조회된 옵션 표시 (AC-7.1)
  - 선택 후 연관 패널 쿼리 재실행 (AC-7.2)
- **엣지/부정 케이스**: 변수 쿼리 실패 → 드롭다운 빈 상태
- **테스트 위치(예정)**: `frontend/src/container/DashboardContainer/DashboardVariablesSelection/__tests__/` (신규)
- **결정성 메모**: MSW variables/query 응답 고정.

### TC-DB-8: 공개 대시보드
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 공개 URL 생성된 대시보드, 인증 없는 상태
- **입력/동작 (When)**: 공개 URL(`/public/dashboards/{token}`)로 접근
- **기대 결과 (Then)**:
  - 인증 없이 대시보드 렌더링 (AC-8.1)
  - 편집 버튼·추가 버튼 미표시 (AC-8.2)
- **엣지/부정 케이스**: 만료된 토큰 → 접근 불가 메시지
- **테스트 위치(예정)**: `frontend/src/pages/PublicDashboard/__tests__/` (신규)
- **결정성 메모**: 인증 컨텍스트 미제공 상태로 렌더.

### TC-DB-9: 로딩 및 에러 처리
- **추적**: REQ-9 (AC-9.1, 9.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 GET /api/v1/dashboards/{id} 지연/404 설정
- **입력/동작 (When)**: 대시보드 상세 페이지 진입
- **기대 결과 (Then)**:
  - 로딩 중 `Spinner` 렌더링 (AC-9.1)
- **엣지/부정 케이스**: 404 응답 → `NotFound` 컴포넌트 렌더 (AC-9.2)
- **테스트 위치(예정)**: `frontend/src/pages/DashboardPage/__tests__/DashboardPage.test.tsx` (신규)
- **결정성 메모**: useDashboardBootstrap isLoading/isError 상태 목킹.

## 미커버 항목 (Gap)
- 패널 드래그·리사이즈 동작 — react-grid-layout E2E 검증 필요 (Playwright 권장)
- 대시보드 임포트/익스포트 (JSON) — 범위 밖

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| - | `pnpm jest src/pages/DashboardsListPage` | - | 미실행 |
| - | `go test ./pkg/modules/dashboard/...` | - | 미실행 |
