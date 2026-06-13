# Test Cases — Alerts (알림)

> 출처 스펙: `.claude/specs/Alerts/requirements.md`

## 요약 추적표
| TC ID | 대상 REQ/AC | 레이어 | 자동화 | 상태 |
|-------|-------------|--------|--------|------|
| TC-AL-1 | REQ-1 / AC-1.1, 1.2 | FE Jest | ✅ | [ ] |
| TC-AL-2 | REQ-2 / AC-2.1, 2.2, 2.3 | Go 단위 + FE Jest | ✅ | [ ] |
| TC-AL-3 | REQ-3 / AC-3.1, 3.2 | Go 단위 | ✅ | [ ] |
| TC-AL-4 | REQ-4 / AC-4.1, 4.2 | FE Jest | ✅ | [ ] |
| TC-AL-5 | REQ-5 / AC-5.1, 5.2 | Go 단위 + FE Jest | ✅ | [ ] |
| TC-AL-6 | REQ-6 / AC-6.1, 6.2 | FE Jest | ✅ | [ ] |
| TC-AL-7 | REQ-7 / AC-7.1, 7.2, 7.3 | FE Jest | ✅ | [ ] |
| TC-AL-8 | REQ-8 / AC-8.1, 8.2 | FE Jest | ✅ | [ ] |
| TC-AL-9 | REQ-9 / AC-9.1, 9.2 | FE Jest | ⬜ | [ ] |
| TC-AL-10 | REQ-10 / AC-10.1, 10.2 | FE Jest | ✅ | [ ] |

## 테스트 케이스 상세

### TC-AL-1: 알림 규칙 목록 조회
- **추적**: REQ-1 (AC-1.1, 1.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 `GET /api/v1/rules` 응답 목킹 (규칙 2건, Normal/Firing 상태)
- **입력/동작 (When)**: `/alerts` 페이지 진입
- **기대 결과 (Then)**:
  - 규칙 이름·상태(Normal/Firing)·생성일 목록 렌더링 (AC-1.1)
- **엣지/부정 케이스**: 규칙 없음 → 빈 상태 UI 표시 (AC-1.2)
- **테스트 위치(예정)**: `frontend/src/pages/AlertList/__tests__/AlertList.test.tsx`
- **결정성 메모**: MSW 고정 응답.

### TC-AL-2: 알림 규칙 생성
- **추적**: REQ-2 (AC-2.1, 2.2, 2.3)
- **레이어**: Go 단위 + FE Jest
- **전제조건 (Given)**: 메타스토어 mock, 규칙 생성 폼 마운트
- **입력/동작 (When)**: 이름 없이 저장 시도
- **기대 결과 (Then)**: 유효성 오류 메시지 표시 (AC-2.1)
- **엣지/부정 케이스**:
  - 유효한 폼 제출 → 생성된 규칙 ID 반환 (AC-2.2)
  - 생성 후 목록 페이지 이동 (AC-2.3)
- **테스트 위치(예정)**: `frontend/src/container/CreateAlertRule/__tests__/`, `pkg/query-service/app/rules_test.go` (신규)
- **결정성 메모**: 폼 유효성 검사는 클라이언트 사이드.

### TC-AL-3: 알림 규칙 수정
- **추적**: REQ-3 (AC-3.1, 3.2)
- **레이어**: Go 단위
- **전제조건 (Given)**: 기존 규칙 ID=1 존재, 메타스토어 mock
- **입력/동작 (When)**: `PUT /api/v1/rules/1` — 임계값 변경
- **기대 결과 (Then)**:
  - 변경된 내용 저장 후 200 반환 (AC-3.1)
- **엣지/부정 케이스**: 없는 ID PUT → 404 반환 (AC-3.2)
- **테스트 위치(예정)**: `pkg/query-service/app/rules_test.go` (신규)
- **결정성 메모**: 메타스토어 mock.

### TC-AL-4: 알림 규칙 삭제
- **추적**: REQ-4 (AC-4.1, 4.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: 규칙 목록 표시, MSW로 DELETE 응답 목킹
- **입력/동작 (When)**: 삭제 버튼 클릭
- **기대 결과 (Then)**: 확인 모달 표시 (AC-4.1)
- **엣지/부정 케이스**: 확인 후 → 목록에서 규칙 제거 (AC-4.2)
- **테스트 위치(예정)**: `frontend/src/pages/AlertList/__tests__/AlertList.test.tsx`
- **결정성 메모**: 모달 confirm 버튼 클릭 시뮬레이션.

### TC-AL-5: 알림 규칙 테스트
- **추적**: REQ-5 (AC-5.1, 5.2)
- **레이어**: Go 단위 + FE Jest
- **전제조건 (Given)**: 유효한 규칙 조건 설정, Reader mock
- **입력/동작 (When)**: `POST /api/v1/testRule` 요청
- **기대 결과 (Then)**:
  - 평가 결과(Firing/Normal) 응답 반환 (AC-5.1)
- **엣지/부정 케이스**: 잘못된 쿼리 조건 → 에러 메시지 포함 응답 (AC-5.2)
- **테스트 위치(예정)**: `pkg/query-service/app/rules_test.go`, `frontend/src/container/CreateAlertRule/__tests__/`
- **결정성 메모**: ClickHouse mock으로 쿼리 결과 고정.

### TC-AL-6: 발생한 알림 목록
- **추적**: REQ-6 (AC-6.1, 6.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 Triggered Alerts 응답 목킹 (Firing 알림 2건)
- **입력/동작 (When)**: "Triggered Alerts" 탭 클릭
- **기대 결과 (Then)**:
  - Firing 알림 이름·시작 시각·레이블 표시 (AC-6.1)
- **엣지/부정 케이스**: 알림 없음 → 빈 상태 UI (AC-6.2)
- **테스트 위치(예정)**: `frontend/src/container/TriggeredAlerts/__tests__/` (신규)
- **결정성 메모**: MSW 고정 응답.

### TC-AL-7: 알림 이력 조회
- **추적**: REQ-7 (AC-7.1, 7.2, 7.3)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 history/stats, /timeline, /top_contributors 응답 목킹
- **입력/동작 (When)**: AlertDetails 페이지 진입
- **기대 결과 (Then)**:
  - 상태 전환 타임라인 차트 렌더링 (AC-7.1)
  - 총 발생 횟수·평균 해소 시간 통계 표시 (AC-7.2)
  - 주요 기여 레이블 목록 표시 (AC-7.3)
- **엣지/부정 케이스**: 이력 없음 → 빈 상태 UI
- **테스트 위치(예정)**: `frontend/src/container/AlertHistory/__tests__/` (신규)
- **결정성 메모**: MSW 타임스탬프 고정.

### TC-AL-8: 알림 채널 관리
- **추적**: REQ-8 (AC-8.1, 8.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: MSW로 채널 목록 응답 목킹 (Slack 채널 1건)
- **입력/동작 (When)**: 채널 설정 페이지 진입
- **기대 결과 (Then)**:
  - 등록된 채널 목록 표시 (AC-8.1)
- **엣지/부정 케이스**: 새 채널 추가 후 규칙 생성 폼에서 선택 가능 (AC-8.2)
- **테스트 위치(예정)**: `frontend/src/container/AllAlertChannels/__tests__/` (신규)
- **결정성 메모**: MSW 고정 응답.

### TC-AL-9: 계획된 다운타임
- **추적**: REQ-9 (AC-9.1, 9.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: PlannedDowntime 컴포넌트 마운트
- **입력/동작 (When)**: 다운타임 기간·대상 규칙·사유 입력 후 저장
- **기대 결과 (Then)**: 기간·대상·사유 필드 입력 가능 (AC-9.1)
- **엣지/부정 케이스**: 다운타임 기간 중 Firing → 알림 미발송 확인 (AC-9.2, 수동 검증)
- **테스트 위치(예정)**: `frontend/src/container/PlannedDowntime/__tests__/` (신규)
- **결정성 메모**: 알림 억제는 Alertmanager 수동 검증.

### TC-AL-10: 라우팅 정책
- **추적**: REQ-10 (AC-10.1, 10.2)
- **레이어**: FE Jest
- **전제조건 (Given)**: RoutingPolicies 컴포넌트 마운트
- **입력/동작 (When)**: 레이블 매처 조건 설정
- **기대 결과 (Then)**:
  - 라우팅 조건(레이블 매처) 설정 UI 렌더링 (AC-10.1)
- **엣지/부정 케이스**: 정책 순서 드래그 변경 (AC-10.2)
- **테스트 위치(예정)**: `frontend/src/container/RoutingPolicies/__tests__/` (신규)
- **결정성 메모**: 드래그 순서 변경은 E2E 권장.

## 미커버 항목 (Gap)
- Alertmanager 실제 채널 전송 검증 — 외부 서비스 의존으로 통합 테스트 필요
- 다운타임 중 알림 억제 동작 (AC-9.2) — Alertmanager 수동 검증 필요

## 실행 결과 기록
| 실행일 | 명령 | 결과 | 비고 |
|--------|------|------|------|
| - | `pnpm jest src/pages/AlertList` | - | 미실행 |
| - | `go test ./pkg/query-service/app/...` | - | 미실행 |
