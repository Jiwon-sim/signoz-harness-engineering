# Design — Alerts (알림)

> requirements.md의 REQ-* 구현 설계. 상태: Approved · 작성일: 2026-06-13
> 참고(실측): `frontend/src/pages/AlertList/index.tsx`, `pkg/query-service/app/http_handler.go`, `pkg/alertmanager/`

## 1. 개요
Alerts는 Alertmanager 기반 알림 시스템으로, 백엔드에서 규칙을 평가하고
Alertmanager가 채널 라우팅·억제를 처리한다.
프론트엔드는 규칙 CRUD, 이력 조회, 채널 관리, 계획된 다운타임, 라우팅 정책을 탭 구조로 제공한다.

## 2. 아키텍처
- 영향 레이어: [x] Frontend [x] Backend(pkg) [ ] EE [x] 메타스토어 [x] Alertmanager
- 배치:
  - `frontend/src/pages/AlertList/` — 탭 기반 메인 페이지
  - `frontend/src/pages/AlertDetails/` — 알림 이력 상세
  - `frontend/src/pages/CreateAlert/` — 규칙 생성
  - `frontend/src/container/ListAlertRules/` — 규칙 목록
  - `frontend/src/container/TriggeredAlerts/` — 발생 알림
  - `frontend/src/container/AlertHistory/` — 이력 타임라인
  - `frontend/src/container/CreateAlertRule/` — 규칙 생성/편집 폼
  - `pkg/query-service/app/http_handler.go` — 알림 라우트 핸들러

- 흐름:
```
/alerts 진입
   └ AlertList (탭)
       ├ Alert Rules 탭 → GET /api/v1/rules → ListAlertRules
       ├ Triggered Alerts 탭 → TriggeredAlerts (Alertmanager 조회)
       ├ Configuration 탭
       │   ├ Planned Downtime
       │   └ Routing Policies
       └ 규칙 클릭 → /alerts/{id}/history → AlertDetails
           ├ POST /api/v1/rules/{id}/history/stats
           ├ POST /api/v1/rules/{id}/history/timeline
           └ POST /api/v1/rules/{id}/history/top_contributors
```

## 3. 백엔드 API (REQ-1~7)

| 엔드포인트 | 메서드 | 핸들러 | 권한 |
|-----------|--------|--------|------|
| `/api/v1/rules` | GET | `listRules` | ViewAccess |
| `/api/v1/rules` | POST | `createRule` | EditAccess |
| `/api/v1/rules/{id}` | GET | `getRule` | ViewAccess |
| `/api/v1/rules/{id}` | PUT | `editRule` | EditAccess |
| `/api/v1/rules/{id}` | DELETE | `deleteRule` | EditAccess |
| `/api/v1/rules/{id}` | PATCH | `patchRule` | EditAccess |
| `/api/v1/testRule` | POST | `testRule` | EditAccess |
| `/api/v1/rules/{id}/history/stats` | POST | `getRuleStats` | ViewAccess |
| `/api/v1/rules/{id}/history/timeline` | POST | `getRuleStateHistory` | ViewAccess |
| `/api/v1/rules/{id}/history/top_contributors` | POST | `getRuleStateHistoryTopContributors` | ViewAccess |
| `/api/v1/rules/{id}/history/overall_status` | POST | `getOverallStateTransitions` | ViewAccess |

### 규칙 평가 흐름
```
Alertmanager ← 규칙 조건 등록 (createRule/editRule 시)
             ↓ 주기적 평가 (독립 실행)
             → Firing 시 알림 채널 전송
```

## 4. 프론트엔드 설계 (REQ-1~10)

### 탭 구조
```typescript
// AlertList 탭
tabs = [
  { key: 'alert-rules',      component: AllAlertRules },
  { key: 'triggered-alerts', component: TriggeredAlerts },
  { key: 'configuration',    component: Configuration (subTabs) }
]
// Configuration subTabs
subTabs = [PlannedDowntime, RoutingPolicies]
```

### 규칙 생성/편집 (REQ-2, 3)
- `container/CreateAlertRule/` — 단계별 폼
  - Step 1: 쿼리 설정 (QueryBuilder 재사용)
  - Step 2: 조건 설정 (임계값, 평가 기간)
  - Step 3: 알림 설정 (채널, 레이블)

### 알림 이력 (REQ-7)
```typescript
// AlertDetails 페이지
useRuleStats(ruleId)         → POST /history/stats
useRuleTimeline(ruleId)      → POST /history/timeline
useTopContributors(ruleId)   → POST /history/top_contributors
```

## 5. 데이터 모델

```typescript
// Alert Rule
interface AlertRule {
  id: number;
  name: string;
  condition: RuleCondition;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  preferredChannels: string[];
  state: 'normal' | 'firing' | 'pending';
}
```

## 6. 에러 처리
- 필수 항목 미입력 → 클라이언트 유효성 검사 (REQ-2, AC-2.1)
- testRule 쿼리 오류 → 에러 메시지 표시 (REQ-5, AC-5.2)
- 존재하지 않는 규칙 수정 → 404 반환 (REQ-3, AC-3.2)

## 7. 테스트 전략
| REQ | 레이어 | 검증 방법 |
|-----|--------|-----------|
| REQ-1 | FE Jest | MSW mock → 규칙 목록 렌더 |
| REQ-2 | Go 단위 | createRule → 메타스토어 저장 |
| REQ-5 | Go 단위 | testRule → 규칙 평가 결과 반환 |
| REQ-7 | FE Jest | AlertDetails 페이지 → 이력 차트 렌더 |

## 8. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|--------------|
| §3 (백엔드 API) | REQ-1~7 |
| §4 (FE 탭·폼) | REQ-1~10 |
