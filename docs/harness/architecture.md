# Architecture — SigNoz 아키텍처 개요

> 하네스 작업 시 "내가 건드리는 부분이 전체 어디에 속하는지" 파악용. 경로는 실측 기준.

## 큰 그림 (데이터 흐름)
```
   계측된 앱 / 인프라
        │  (OTLP)
        ▼
 OpenTelemetry Collector ──────────┐
 (signoz-otel-collector)           │ 가공·배치
        │                          ▼
        ▼                    ┌──────────────┐
   ClickHouse  ◀─────────────│ 로그/메트릭/  │
   (관측 데이터 저장)         │ 트레이스 저장 │
        ▲                    └──────────────┘
        │ 쿼리
        │
 ┌──────────────┐   메타데이터(대시보드/알림/유저)   ┌──────────────┐
 │ Query Service│◀─────────────────────────────────▶│  메타스토어   │
 │  (Go 백엔드)  │                                   │ Postgres/SQLite│
 └──────┬───────┘                                   └──────────────┘
        │ REST API
        ▼
   Frontend (React/TS)  ── 쿼리빌더·대시보드·트레이스·로그·알림 UI
```

## 구성 요소

### 1. 수집 — OpenTelemetry Collector
- 앱/인프라의 텔레메트리를 OTLP 로 수신, 가공 후 ClickHouse 에 적재.
- 로컬: `make devenv-signoz-otel-collector`.

### 2. 저장
- **ClickHouse**: 로그·메트릭·트레이스 (대용량 시계열, 컬럼형). 핵심 데이터 스토어.
- **메타스토어 (Postgres/SQLite)**: 대시보드·알림규칙·사용자·조직 등 메타데이터.
  접근은 `pkg/sqlstore`, 스키마 변경은 `pkg/sqlmigration`.

### 3. 백엔드 (Go, `pkg/` · `ee/`)
- **Query Service** (`pkg/query-service`): API·쿼리 처리의 중심.
- **Querier** (`pkg/querier`): 관측 데이터 질의 추상화.
- **Alertmanager** (`pkg/alertmanager`) · **Ruler** (`pkg/ruler`): 알림 평가·발송.
- **도메인 모듈** (`pkg/modules/<도메인>`): dashboard, inframonitoring, logspipeline,
  metricsexplorer, organization, cloudintegration 등.
- **조립**: `pkg/factory`(DI) · `pkg/config` · `pkg/signoz`(와이어링).
- **진입점**: `cmd/community/`, `cmd/enterprise/` (빌드 타깃 분리).
- **에디션**: Community(`pkg/`, Apache 2.0) ↔ Enterprise(`ee/`, 상용). `ee/` 가 `pkg/` 를 미러링.

### 4. 프론트엔드 (React/TS, `frontend/src/`)
- `pages/`(라우트) → `container/`(큰 묶음) → `components/`(재사용 조각).
- 서버 상태는 **react-query** + orval 생성 훅(`api/generated`).
- 차트: uPlot/Chart.js/visx. UI: AntD 5 + `@signozhq/ui`.

### 5. 배포 (`deploy/`)
- 현재: Docker, docker-swarm.
- **향후 (하네스 목표)**: Jenkins CI/CD 분리 → 로컬 Kubernetes 배포.
  ([ci-cd-roadmap.md](./ci-cd-roadmap.md), [k8s-deployment.md](./k8s-deployment.md))

## "어디를 건드리나" 빠른 판단
| 작업 종류 | 주 위치 |
|-----------|---------|
| 새 쿼리/집계 로직 | `pkg/querier`, 쿼리빌더 |
| 새 대시보드/패널 UI | `frontend/src/container`, `components` |
| 알림 규칙 동작 | `pkg/ruler`, `pkg/alertmanager` |
| 메타데이터 스키마 변경 | `pkg/sqlmigration` (+ 마이그레이션) |
| 인프라 모니터링 | `pkg/modules/inframonitoring` |
| EE 전용 기능 | `ee/modules/...` |

## 관련
- 구조 규칙: `.claude/steering/structure.md`
- DB 규칙: `.claude/steering/database.md`
- 용어: [glossary.md](./glossary.md)
