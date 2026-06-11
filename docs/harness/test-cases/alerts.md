# Test Cases — Alerts

> 기능 영역: Alerts ([feature-catalog.md](../feature-catalog.md) #9, #10)
> 라우트: `LIST_ALL_ALERT`, `ALERTS_NEW`, `EDIT_ALERTS`, `ALERT_HISTORY`, `ALERT_OVERVIEW`, `CHANNELS_NEW`, `ALL_CHANNELS`
> 백엔드: `pkg/alertmanager`, `pkg/ruler`, `pkg/modules/rulestatehistory`

## 요약 추적표
| TC ID | 대상 동작 | 레이어 | 자동화 | 상태 |
|-------|-----------|--------|--------|------|
| TC-ALR-1 | 알림 규칙 목록 표시 | E2E / 통합 | ⬜ | [ ] |
| TC-ALR-2 | 새 알림 규칙 생성 | E2E / 통합 | ⬜ | [ ] |
| TC-ALR-3 | 규칙 편집·저장 | E2E | ⬜ | [ ] |
| TC-ALR-4 | 규칙 평가 → 발화 | Go 단위 / 통합 | ⬜ | [ ] |
| TC-ALR-5 | 알림 이력 표시 | E2E / 통합 | ⬜ | [ ] |
| TC-ALR-6 | 알림 채널 생성·테스트 | E2E / 통합 | ⬜ | [ ] |

## 상세

### TC-ALR-1: 알림 규칙 목록
- **When**: `/alerts`(LIST_ALL_ALERT) 진입.
- **Then**: 규칙명·상태(정상/발화/비활성)·심각도가 목록에 표시된다.
- **엣지**: 규칙 0개 → 빈 상태 + 'New Alert' 유도.

### TC-ALR-2: 새 알림 규칙 생성
- **Given**: 알림 생성 화면(`ALERTS_NEW`).
- **When**: 메트릭/로그/트레이스 기반 조건 + 임계값 + 채널 지정 후 저장.
- **Then**: 규칙이 생성되어 목록에 나타나고 평가 대상이 된다.
- **엣지**: 필수값 누락 → 검증 에러. 잘못된 임계값 → 저장 차단.
- **통합**: 생성 API → 메타스토어 저장 → ruler 등록.

### TC-ALR-3: 규칙 편집
- **When**: 기존 규칙의 임계값/조건 변경 후 저장(`EDIT_ALERTS`).
- **Then**: 변경이 반영되고, 이후 평가에 새 조건이 적용된다.
- **엣지**: 동시 편집 충돌 처리(확인 필요).

### TC-ALR-4: 규칙 평가 → 발화 (핵심 회귀 위험)
- **Given**: 임계값 초과 조건의 시계열.
- **When**: ruler 가 규칙을 평가.
- **Then**: 조건 충족 시 알림이 firing 상태로 전이되고 채널로 발송된다.
- **Go 단위**: `ruler` 평가 로직 테이블 드리븐(임계 미만/초과/경계값).
- **결정성**: 고정 입력 시계열 + 고정 시계.

### TC-ALR-5: 알림 이력
- **When**: `/alerts/history`(ALERT_HISTORY) 진입.
- **Then**: 규칙별 상태 전이(정상↔발화) 타임라인이 표시된다.
- **통합**: `modules/rulestatehistory` 기록↔조회 일치.

### TC-ALR-6: 알림 채널
- **Given**: 채널 생성 화면(`CHANNELS_NEW`).
- **When**: Slack/Email/Webhook 등 채널 설정 + 'Test' 발송.
- **Then**: 채널이 저장되고 테스트 메시지가 전송된다.
- **엣지**: 잘못된 webhook URL → 검증/에러. 발송 실패 → 에러 표면화.

## 미커버 / 확인 필요
- 이상탐지(anomaly) 기반 알림은 EE(`ee/anomaly`) → 에디션 분리 확인.
- 알림 억제(silence)/그룹화 동작 → alertmanager 설정 기반, 별도 TC.
