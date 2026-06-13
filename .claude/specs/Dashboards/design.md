# Design — Dashboards (대시보드)

> requirements.md의 REQ-* 구현 설계. 상태: Approved · 작성일: 2026-06-13
> 참고(실측): `frontend/src/pages/DashboardPage/index.tsx`, `pkg/modules/dashboard/`, `pkg/query-service/app/http_handler.go`

## 1. 개요
Dashboards는 메타스토어(Postgres/SQLite)에 대시보드 정의를 저장하고,
DashboardContainer가 패널별 QueryBuilder 쿼리를 실행해 ClickHouse에서 데이터를 가져와 렌더링한다.
변수 시스템, 잠금, 공개 URL 기능이 추가된 복합 기능이다.

## 2. 아키텍처
- 영향 레이어: [x] Frontend [x] Backend(pkg) [ ] EE [x] ClickHouse(읽기) [x] 메타스토어(쓰기)
- 배치:
  - `frontend/src/pages/DashboardsListPage/` — 목록 페이지
  - `frontend/src/pages/DashboardPage/` — 상세/편집 페이지
  - `frontend/src/container/DashboardContainer/` — 패널 렌더링·편집 컨테이너
  - `frontend/src/container/GridCardLayout/` — 드래그·리사이즈 레이아웃
  - `pkg/modules/dashboard/` — 백엔드 도메인 모듈
  - `pkg/query-service/app/http_handler.go` — 대시보드 라우트 핸들러

- 흐름:
```
/dashboards 진입
   └ DashboardsListPage → GET /api/v1/dashboards → 카드 목록
       └ 대시보드 클릭 → /dashboards/{id}
           └ DashboardPage
               ├ useDashboardBootstrap → GET /api/v1/dashboards/{id}
               ├ DashboardContainer → GridCardLayout (드래그·리사이즈)
               │   └ 각 패널 → POST /api/v3/query_range (ClickHouse)
               └ DashboardVariablesSelection → POST /api/v2/variables/query
```

## 3. 백엔드 API (REQ-1~8)

| 엔드포인트 | 메서드 | 핸들러 | 권한 |
|-----------|--------|--------|------|
| `/api/v1/dashboards` | GET | `List` | ViewAccess |
| `/api/v1/dashboards` | POST | `Dashboard.Create` | EditAccess |
| `/api/v1/dashboards/{id}` | GET | `Get` | ViewAccess |
| `/api/v1/dashboards/{id}` | PUT | `Dashboard.Update` | EditAccess |
| `/api/v1/dashboards/{id}` | DELETE | `Dashboard.Delete` | EditAccess |
| `/api/v1/dashboards/{id}/lock` | PUT | `Dashboard.LockUnlock` | EditAccess |
| `/api/v2/variables/query` | POST | `queryDashboardVarsV2` | ViewAccess |

### 데이터 저장
- 대시보드 정의: 메타스토어(`pkg/modules/dashboard`) — `dashboards` 테이블
- 패널 데이터: ClickHouse — `/api/v3/query_range` 실시간 조회 (저장 없음)

## 4. 프론트엔드 설계 (REQ-1~9)

### 상태 관리
- **대시보드 전역 상태**: `useDashboardStore` (Zustand) — 패널·변수·레이아웃
- **부트스트랩**: `useDashboardBootstrap(dashboardId)` — 초기 로드 + 에러 처리
- **편집 모드**: `DashboardContainer` 내 편집/저장/취소 상태

### 주요 컴포넌트
| 컴포넌트 | 역할 |
|---------|------|
| `DashboardContainer` | 패널 목록 렌더링 + 편집 모드 관리 |
| `GridCardLayout` | react-grid-layout 기반 드래그·리사이즈 |
| `DashboardVariablesSelection` | 변수 드롭다운 + 쿼리 연동 |
| `DashboardSettings` | 변수 설정, 공개 URL 설정 |
| `PublicDashboard` | 인증 없이 공개 URL 렌더링 |

### 잠금 상태 (REQ-6)
```typescript
// useDashboardStore에서 잠금 상태 관리
isLocked: boolean
→ 잠금 시 패널 편집 버튼, 추가/삭제 버튼 모두 비활성화
→ PUT /api/v1/dashboards/{id}/lock 호출로 토글
```

### 변수 시스템 (REQ-7)
```typescript
// 변수 선택 → 패널 쿼리 재실행
DashboardVariablesSelection
  → POST /api/v2/variables/query (옵션 조회)
  → 선택값을 Zustand store에 저장
  → 변수를 참조하는 모든 패널이 자동 재조회
```

## 5. 데이터 모델

```typescript
// Dashboard (메타스토어)
interface Dashboard {
  id: string;
  uuid: string;
  data: {
    title: string;
    description: string;
    tags: string[];
    widgets: Widget[];
    variables: Record<string, Variable>;
    layout: GridLayout[];
  };
  isLocked: boolean;
  createdAt: string;
}
```

## 6. 에러 처리
- 존재하지 않는 ID → 404 → `NotFound` 컴포넌트 (REQ-9, AC-3.3)
- 로딩 중 → `Spinner` 컴포넌트 (REQ-9, AC-9.1)
- 잠긴 대시보드 수정 시도 → EditAccess 체크 → 403 반환 (REQ-6)

## 7. 테스트 전략
| REQ | 레이어 | 검증 방법 |
|-----|--------|-----------|
| REQ-1 | FE Jest | MSW mock → 대시보드 카드 목록 렌더 |
| REQ-2 | Go 단위 | Create 핸들러 → 메타스토어 저장 확인 |
| REQ-3 | FE Jest | useDashboardBootstrap → 패널 렌더 |
| REQ-4 | Go 단위 | Update 핸들러 + 잠금 상태 차단 |
| REQ-6 | FE Jest | 잠금 상태 → 편집 버튼 비활성 확인 |
| REQ-7 | FE Jest | 변수 선택 → 패널 재조회 트리거 확인 |

## 8. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|--------------|
| §3 (백엔드 CRUD) | REQ-1~6 |
| §4 (FE 상태·컴포넌트) | REQ-3, REQ-6, REQ-7, REQ-8, REQ-9 |
| §4 (변수 시스템) | REQ-7 |
