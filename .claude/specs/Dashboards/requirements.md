# Requirements — Dashboards (대시보드)

> EARS(Easy Approach to Requirements Syntax) 형식.
> 상태: **Draft** · 작성일: 2026-06-13 · 에디션: **Community** (`pkg/modules/dashboard`)
> 관련 코드: [pages/DashboardsListPage](../../../frontend/src/pages/DashboardsListPage/), [pages/DashboardPage](../../../frontend/src/pages/DashboardPage/), [http_handler.go](../../../pkg/query-service/app/http_handler.go)

## 1. 개요 (Introduction)
Dashboards는 SigNoz의 커스텀 시각화 기능으로, 사용자가 메트릭·로그·트레이스 쿼리를
다양한 패널(차트, 테이블, 게이지 등)로 구성하고 저장·공유할 수 있게 한다.
메타스토어(Postgres/SQLite)에 대시보드 정의를 저장하며, 팀 협업을 위한 잠금·공개 URL 기능을 포함한다.

## 2. 용어 (Glossary)
- **Dashboard**: 하나 이상의 패널로 구성된 시각화 화면. 메타스토어에 JSON으로 저장.
- **Panel(Widget)**: 대시보드 내 단일 시각화 단위 (그래프, 테이블, 게이지 등).
- **Variable**: 대시보드 전체에 적용되는 동적 파라미터 (예: 서비스명 필터).
- **Lock**: 대시보드 편집 방지 상태. 잠긴 대시보드는 수정 불가.
- **Public Dashboard**: 인증 없이 공유 가능한 읽기 전용 대시보드 URL.

## 3. 요구사항 (EARS)

### REQ-1: 대시보드 목록 조회
- **유형**: Event-driven
- **명세**: WHEN 사용자가 대시보드 목록 페이지(`/dashboards`)에 진입하면 THE SYSTEM SHALL `GET /api/v1/dashboards`를 호출해 전체 대시보드 목록을 카드/테이블 형태로 표시한다.
- **근거**: 보유 대시보드를 한 곳에서 탐색·관리해야 한다.
- **수용 기준**:
  - [ ] AC-1.1: 대시보드 이름·태그·생성일이 목록에 표시된다.
  - [ ] AC-1.2: 목록에서 특정 대시보드를 클릭하면 상세 페이지로 이동한다.
  - [ ] AC-1.3: 대시보드가 없을 때 빈 상태 UI가 표시된다.

### REQ-2: 대시보드 생성
- **유형**: Event-driven
- **명세**: WHEN 사용자가 "New Dashboard" 버튼을 클릭하면 THE SYSTEM SHALL `POST /api/v1/dashboards`를 호출해 빈 대시보드를 생성하고 편집 페이지로 이동한다.
- **근거**: 새로운 모니터링 화면을 직접 구성할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-2.1: 생성 후 새 대시보드 ID가 반환된다.
  - [ ] AC-2.2: 생성된 대시보드 편집 페이지(`/dashboards/{id}`)로 자동 이동한다.

### REQ-3: 대시보드 조회 (상세)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 대시보드 상세 페이지에 진입하면 THE SYSTEM SHALL `GET /api/v1/dashboards/{id}`를 호출해 패널·변수·레이아웃 정보를 로드하고 렌더링한다.
- **근거**: 저장된 대시보드를 불러와 시각화를 확인해야 한다.
- **수용 기준**:
  - [ ] AC-3.1: 대시보드 타이틀·설명이 헤더에 표시된다.
  - [ ] AC-3.2: 각 패널이 정의된 위치·크기로 렌더링된다.
  - [ ] AC-3.3: 존재하지 않는 ID 요청 시 NotFound 화면이 표시된다.

### REQ-4: 대시보드 수정
- **유형**: Event-driven
- **명세**: WHEN 사용자가 대시보드 편집 모드에서 변경 후 저장하면 THE SYSTEM SHALL `PUT /api/v1/dashboards/{id}`를 호출해 업데이트된 패널·레이아웃·변수를 저장한다.
- **근거**: 대시보드를 지속적으로 개선·유지할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-4.1: 저장 후 변경된 내용이 즉시 반영된다.
  - [ ] AC-4.2: 잠긴 대시보드는 수정 API 호출이 차단된다.

### REQ-5: 대시보드 삭제
- **유형**: Event-driven
- **명세**: WHEN 사용자가 대시보드 삭제를 확인하면 THE SYSTEM SHALL `DELETE /api/v1/dashboards/{id}`를 호출하고 목록 페이지로 이동한다.
- **근거**: 불필요한 대시보드를 정리할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-5.1: 삭제 전 확인 모달이 표시된다.
  - [ ] AC-5.2: 삭제 후 목록에서 해당 대시보드가 제거된다.

### REQ-6: 대시보드 잠금/잠금 해제
- **유형**: Event-driven
- **명세**: WHEN 사용자가 Lock/Unlock 버튼을 클릭하면 THE SYSTEM SHALL `PUT /api/v1/dashboards/{id}/lock`을 호출해 편집 방지 상태를 토글한다.
- **근거**: 운영 중인 대시보드가 실수로 수정되지 않도록 보호해야 한다.
- **수용 기준**:
  - [ ] AC-6.1: 잠금 상태에서 패널 편집 버튼이 비활성화된다.
  - [ ] AC-6.2: 잠금/해제 후 상태가 즉시 UI에 반영된다.

### REQ-7: 대시보드 변수 (Variables)
- **유형**: Event-driven
- **명세**: WHEN 사용자가 대시보드 변수 값을 변경하면 THE SYSTEM SHALL `POST /api/v2/variables/query`로 변수 옵션을 조회하고, 변수를 참조하는 모든 패널 쿼리를 자동으로 재실행한다.
- **근거**: 서비스명·환경 등을 변수로 설정해 대시보드를 동적으로 필터링해야 한다.
- **수용 기준**:
  - [ ] AC-7.1: 변수 드롭다운에 조회된 옵션이 표시된다.
  - [ ] AC-7.2: 변수 선택 시 연관 패널이 자동 갱신된다.

### REQ-8: 공개 대시보드 (Public Dashboard)
- **유형**: Optional
- **명세**: WHERE 공개 대시보드 기능이 활성화되어 있으면 THE SYSTEM SHALL 인증 없이 접근 가능한 고유 공개 URL을 생성해 읽기 전용으로 대시보드를 공유할 수 있게 한다.
- **근거**: 외부 이해관계자에게 인증 없이 모니터링 화면을 공유할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-8.1: 공개 URL로 접근 시 인증 없이 대시보드가 렌더링된다.
  - [ ] AC-8.2: 공개 URL에서 편집 기능이 완전히 비활성화된다.

### REQ-9: 로딩 및 에러 처리
- **유형**: State-driven / Unwanted
- **명세**:
  - WHILE 대시보드 데이터를 로딩 중이면 THE SYSTEM SHALL 스피너를 표시한다.
  - IF 대시보드 로드에 실패하면 THEN THE SYSTEM SHALL 에러 메시지를 표시한다.
- **근거**: 네트워크 오류·권한 문제 시 사용자가 상태를 파악할 수 있어야 한다.
- **수용 기준**:
  - [ ] AC-9.1: 로딩 중 `Spinner` 컴포넌트가 표시된다.
  - [ ] AC-9.2: 404 에러 시 `NotFound` 컴포넌트가 표시된다.

## 4. 비기능 요구사항 (Non-functional)
- **성능**: 대시보드 로드 p95 < 2s (패널 10개, 1시간 범위 기준).
- **보안**: 조회는 ViewAccess, 생성·수정·삭제·잠금은 EditAccess 권한 필요.
- **저장소**: 대시보드 정의는 메타스토어(Postgres/SQLite)에 저장. ClickHouse 미사용.
- **에디션**: Community 범위. `pkg/modules/dashboard` 사용.

## 5. 범위 밖 (Out of scope)
- 대시보드 알림 연동 (Alerts 기능과 별개).
- 대시보드 임포트/익스포트 (JSON 파일).
- 버전 이력 관리.

## 6. 추적 (Traceability)
| 요구사항 | 설계 섹션 | 태스크 | 테스트 케이스 |
|----------|-----------|--------|----------------|
| REQ-1 | design.md §3 | TASK-1 | TC-DB-1 |
| REQ-2 | design.md §3 | TASK-1 | TC-DB-2 |
| REQ-3 | design.md §3, §4 | TASK-1, 2 | TC-DB-3 |
| REQ-4 | design.md §3, §4 | TASK-1, 2 | TC-DB-4 |
| REQ-5 | design.md §3 | TASK-1 | TC-DB-5 |
| REQ-6 | design.md §3 | TASK-1 | TC-DB-6 |
| REQ-7 | design.md §4 | TASK-2 | TC-DB-7 |
| REQ-8 | design.md §4 | TASK-2 | TC-DB-8 |
| REQ-9 | design.md §4 | TASK-2 | TC-DB-9 |
