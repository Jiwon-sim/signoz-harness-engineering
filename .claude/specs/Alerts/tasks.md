# Tasks — Alerts (알림)

> design.md를 실행 작업으로 분해. 상태: 기존 구현 문서화 완료.

## TASK-1: 백엔드 알림 규칙 API (기존 구현 확인)
- **충족**: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-7
- **대상 파일**:
  - `pkg/query-service/app/http_handler.go` (listRules, createRule, editRule, deleteRule, testRule, 이력 핸들러)
  - `pkg/alertmanager/` (Alertmanager 연동)
  - `pkg/modules/rulestatehistory/` (이력 저장·조회)
- **세부**:
  - [x] 1.1 `GET /api/v1/rules` — 목록 조회
  - [x] 1.2 `POST /api/v1/rules` — 생성 + Alertmanager 등록
  - [x] 1.3 `PUT /api/v1/rules/{id}` — 수정
  - [x] 1.4 `DELETE /api/v1/rules/{id}` — 삭제
  - [x] 1.5 `POST /api/v1/testRule` — 규칙 즉시 평가
  - [x] 1.6 이력 API (`/history/stats`, `/timeline`, `/top_contributors`, `/overall_status`)
- **검증 게이트**: `go build ./pkg/query-service/...`

## TASK-2: 프론트엔드 알림 UI (기존 구현 확인)
- **충족**: REQ-1~10
- **대상 파일**:
  - `frontend/src/pages/AlertList/index.tsx`
  - `frontend/src/container/ListAlertRules/`
  - `frontend/src/container/CreateAlertRule/`
  - `frontend/src/container/TriggeredAlerts/`
  - `frontend/src/container/AlertHistory/`
  - `frontend/src/container/PlannedDowntime/`
  - `frontend/src/container/RoutingPolicies/`
- **세부**:
  - [x] 2.1 탭 구조 (Alert Rules / Triggered / Configuration)
  - [x] 2.2 규칙 생성/편집 폼 (QueryBuilder + 조건 + 채널)
  - [x] 2.3 발생 알림 목록
  - [x] 2.4 알림 이력 타임라인·통계·기여자
  - [x] 2.5 계획된 다운타임 관리
  - [x] 2.6 라우팅 정책 관리
- **검증 게이트**: `pnpm tsgo --noEmit`

## TASK-3: 테스트 커버리지 확인
- **기존 테스트**: `frontend/src/pages/AlertList/__tests__/`
- **테스트 공백 (추가 필요)**:
  - [ ] 3.1 규칙 생성 폼 유효성 검사 단위 테스트
  - [ ] 3.2 testRule 에러 응답 처리 단위 테스트
  - [ ] 3.3 이력 타임라인 렌더링 단위 테스트
- **검증 게이트**: `pnpm jest src/pages/AlertList`

## 완료 정의 (DoD)
- [x] REQ-1~10 구현 확인
- [ ] 테스트 공백(3.1~3.3) 보완 시 완전한 DoD 달성
