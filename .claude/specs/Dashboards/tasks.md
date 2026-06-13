# Tasks — Dashboards (대시보드)

> design.md를 실행 작업으로 분해. 상태: 기존 구현 문서화 완료.

## TASK-1: 백엔드 대시보드 CRUD API (기존 구현 확인)
- **충족**: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6
- **대상 파일**:
  - `pkg/modules/dashboard/` (Create, Get, List, Update, Delete, LockUnlock)
  - `pkg/query-service/app/http_handler.go` (대시보드 라우트 등록)
- **세부**:
  - [x] 1.1 `GET /api/v1/dashboards` — 목록 조회
  - [x] 1.2 `POST /api/v1/dashboards` — 생성
  - [x] 1.3 `GET /api/v1/dashboards/{id}` — 상세 조회
  - [x] 1.4 `PUT /api/v1/dashboards/{id}` — 수정
  - [x] 1.5 `DELETE /api/v1/dashboards/{id}` — 삭제
  - [x] 1.6 `PUT /api/v1/dashboards/{id}/lock` — 잠금/해제
  - [x] 1.7 `POST /api/v2/variables/query` — 변수 쿼리
- **검증 게이트**: `go build ./pkg/modules/dashboard/...`

## TASK-2: 프론트엔드 대시보드 UI (기존 구현 확인)
- **충족**: REQ-1~9
- **대상 파일**:
  - `frontend/src/pages/DashboardsListPage/DashboardsListPage.tsx`
  - `frontend/src/pages/DashboardPage/index.tsx`
  - `frontend/src/container/DashboardContainer/`
  - `frontend/src/container/GridCardLayout/`
- **세부**:
  - [x] 2.1 대시보드 목록 + 카드 렌더링
  - [x] 2.2 `useDashboardBootstrap` — 대시보드 로드 + 에러 처리
  - [x] 2.3 패널 렌더링 + 드래그·리사이즈 (`GridCardLayout`)
  - [x] 2.4 잠금 상태 UI 반영
  - [x] 2.5 변수 드롭다운 + 패널 자동 갱신
  - [x] 2.6 공개 대시보드 (`PublicDashboard`)
- **검증 게이트**: `pnpm tsgo --noEmit`

## TASK-3: 테스트 커버리지 확인
- **기존 테스트**: `frontend/src/pages/DashboardsListPage/__tests__/`
- **테스트 공백 (추가 필요)**:
  - [ ] 3.1 잠금 상태에서 편집 버튼 비활성 단위 테스트
  - [ ] 3.2 변수 선택 → 패널 재조회 트리거 테스트
  - [ ] 3.3 백엔드 Create/Delete Go 단위 테스트
- **검증 게이트**: `pnpm jest src/pages/DashboardsListPage`

## 완료 정의 (DoD)
- [x] REQ-1~9 구현 확인
- [ ] 테스트 공백(3.1~3.3) 보완 시 완전한 DoD 달성
