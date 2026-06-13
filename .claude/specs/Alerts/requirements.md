# Requirements — Alerts (알림)

> EARS(Easy Approach to Requirements Syntax) 형식.
> 상태: **Draft** · 작성일: 2026-06-13 · 에디션: **Community** (`pkg/query-service`)
> 관련 코드: [pages/AlertList](../../../frontend/src/pages/AlertList/), [pages/CreateAlert](../../../frontend/src/pages/CreateAlert/), [http_handler.go](../../../pkg/query-service/app/http_handler.go)

## 1. 개요 (Introduction)
Alerts는 SigNoz의 알림 관리 기능으로, 사용자가 메트릭·로그·트레이스 기반 임계치 규칙을
생성·관리하고, 발생한 알림을 추적·분석할 수 있게 한다.
Alertmanager와 연동해 Slack·PagerDuty 등 다양한 채널로 알림을 전달한다.

## 2. 용어 (Glossary)
- **Alert Rule**: 특정 조건(임계치·이상탐지)을 정의한 알림 규칙. 고유 ID로 식별.
- **Triggered Alert**: 규칙 조건이 충족되어 실제로 발생한 알림 인스턴스.
- **Alert Channel**: 알림을 전달하는 외부 채널 (Slack, PagerDuty, Email 등).
- **Planned Downtime**: 예정된 유지보수 기간 동안 알림을 억제하는 설정.
- **Routing Policy**: 알림을 특정 채널로 라우팅하는 규칙.
- **Rule State History**: 알림 규칙의 상태 전환 이력 (Normal ↔ Firing).

## 3. 요구사항 (EARS)

### REQ-1: 알림 규칙 목록 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 알림 목록 페이지(`/alerts`)에 진입하면 THE SYSTEM SHALL `GET /api/v1/rules`를 호출해 전체 알림 규칙 목록을 표시한다.
- **근거**: 운영 중인 모든 알림 규칙을 한 곳에서 파악·관리해야 한다.
- **수용 기준**:
  - [ ] AC-1.1: 규칙 이름·상태(Normal/Firing)·생성일이 목록에 표시된다.
  - [ ] AC-1.2: 규칙이 없을 때 빈 상태 UI가 표시된다.

### REQ-2: 알림 규칙 생성
- **유형**: Event-driven
- **명세**: WHEN 사용자가 알림 규칙 생성 폼을 완성하고 저장하면 THE SYSTEM SHALL `POST /api/v1/rules`를 호출해 새 규칙을 저장하고 목록 페이지로 이동한다.
- **근거**: 새 임계치 조건을 설정해 장애를 사전에 탐지해야 한다.
- **수용 기준**:
  - [ ] AC-2.1: 필수 항목(이름·조건·채널) 미입력 시 유효성 오류가 표시된다.
  - [ ] AC-2.2: 저장 후 생성된 규칙 ID가 반환된다.
  - [ ] AC-2.3: 생성 후 목록 페이지로 이동한다.

### REQ-3: 알림 규칙 수정
- **유형**: Event-driven
- **명세**: WHEN 사용자가 기존 규칙을 수정하고 저장하면 THE SYSTEM SHALL `PUT /api/v1/rules/{id}`를 호출해 변경된 내용을 저장한다.
- **근거**: 운영 환경 변화에 맞게 알림 조건을 조정해야 한다.
- **수용 기준**:
  - [ ] AC-3.1: 저장 후 변경된 내용이 목록에 즉시 반영된다.
  - [ ] AC-3.2: 존재하지 않는 ID 수정 시 404 에러가 반환된다.

### REQ-4: 알림 규칙 삭제
- **유형**: Event-driven
- **명세**: WHEN 사용자가 알림 규칙 삭제를 확인하면 THE SYSTEM SHALL `DELETE /api/v1/rules/{id}`를 호출하고 목록에서 제거한다.
- **근거**: 더 이상 필요 없는 알림 규칙을 정리할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-4.1: 삭제 전 확인 모달이 표시된다.
  - [ ] AC-4.2: 삭제 후 목록에서 해당 규칙이 제거된다.

### REQ-5: 알림 규칙 테스트
- **유형**: Event-driven
- **명세**: WHEN 사용자가 규칙 생성/편집 중 "Test Rule" 버튼을 클릭하면 THE SYSTEM SHALL `POST /api/v1/testRule`을 호출해 현재 조건의 평가 결과를 즉시 반환한다.
- **근거**: 규칙을 실제 저장 전에 조건이 올바른지 검증해야 한다.
- **수용 기준**:
  - [ ] AC-5.1: 테스트 결과(Firing/Normal)가 UI에 표시된다.
  - [ ] AC-5.2: 쿼리 오류 시 에러 메시지가 표시된다.

### REQ-6: 발생한 알림 (Triggered Alerts)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 "Triggered Alerts" 탭을 선택하면 THE SYSTEM SHALL 현재 Firing 상태인 알림 목록을 표시한다.
- **근거**: 현재 장애 상황을 실시간으로 파악해야 한다.
- **수용 기준**:
  - [ ] AC-6.1: Firing 중인 알림 이름·시작 시각·레이블이 표시된다.
  - [ ] AC-6.2: 알림 없을 때 빈 상태 UI가 표시된다.

### REQ-7: 알림 이력 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 특정 알림 규칙의 이력 페이지에 진입하면 THE SYSTEM SHALL `POST /api/v1/rules/{id}/history/timeline`과 `/history/stats`를 호출해 상태 전환 이력과 통계를 표시한다.
- **근거**: 알림 규칙의 신뢰도와 오탐률을 분석해야 한다.
- **수용 기준**:
  - [ ] AC-7.1: 상태 전환 타임라인(Normal↔Firing)이 시각화된다.
  - [ ] AC-7.2: 총 발생 횟수·평균 해소 시간 통계가 표시된다.
  - [ ] AC-7.3: 주요 기여 레이블(`top_contributors`)이 표시된다.

### REQ-8: 알림 채널 관리
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 알림 채널(Slack, PagerDuty, Email 등) 목록 조회·생성·수정·삭제를 지원한다.
- **근거**: 알림을 적절한 수신처로 전달하는 채널을 관리해야 한다.
- **수용 기준**:
  - [ ] AC-8.1: 채널 목록 페이지에서 등록된 채널이 표시된다.
  - [ ] AC-8.2: 새 채널 추가 후 규칙 생성 폼에서 선택 가능하다.

### REQ-9: 계획된 다운타임 (Planned Downtime)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 Planned Downtime을 등록하면 THE SYSTEM SHALL 지정된 기간 동안 해당 규칙의 알림 발송을 억제한다.
- **근거**: 예정된 배포·점검 중 불필요한 알림을 방지해야 한다.
- **수용 기준**:
  - [ ] AC-9.1: 다운타임 기간·대상 규칙·사유를 지정할 수 있다.
  - [ ] AC-9.2: 다운타임 기간 중 해당 규칙이 Firing되어도 알림이 발송되지 않는다.

### REQ-10: 라우팅 정책 (Routing Policies)
- **유형**: Ubiquitous
- **명세**: THE SYSTEM SHALL 알림 레이블 조건에 따라 특정 채널로 라우팅하는 정책 관리를 지원한다.
- **근거**: 팀별·심각도별로 다른 채널(Slack #ops vs PagerDuty)로 알림을 분리해야 한다.
- **수용 기준**:
  - [ ] AC-10.1: 라우팅 조건(레이블 매처) 설정이 가능하다.
  - [ ] AC-10.2: 정책 순서를 변경할 수 있다.

## 4. 비기능 요구사항 (Non-functional)
- **보안**: 조회는 ViewAccess, 생성·수정·삭제는 EditAccess 권한 필요.
- **에디션**: Community 범위. Alertmanager 연동은 `pkg/alertmanager` 사용.
- **신뢰성**: 알림 규칙 평가는 Alertmanager가 독립적으로 수행. 쿼리 서비스 재시작에도 유지.

## 5. 범위 밖 (Out of scope)
- 이상탐지(Anomaly Detection) 기반 알림 (EE 기능).
- Alertmanager 자체 설정 변경.
- 알림 집계(Grouping) 고급 설정.

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §3 | TASK-1 | TC-AL-1 |
| REQ-2 | design.md §3 | TASK-1 | TC-AL-2 |
| REQ-3 | design.md §3 | TASK-1 | TC-AL-3 |
| REQ-4 | design.md §3 | TASK-1 | TC-AL-4 |
| REQ-5 | design.md §3 | TASK-1 | TC-AL-5 |
| REQ-6 | design.md §4 | TASK-2 | TC-AL-6 |
| REQ-7 | design.md §4 | TASK-2 | TC-AL-7 |
| REQ-8 | design.md §4 | TASK-2 | TC-AL-8 |
| REQ-9 | design.md §4 | TASK-2 | TC-AL-9 |
| REQ-10 | design.md §4 | TASK-2 | TC-AL-10 |
