# SigNoz Feature Catalog — 전체 기능 분석

> **사실 기반 분석.** 출처: `frontend/src/AppRoutes/routes.ts`(사용자 대면 라우트), `pkg/modules/`·`ee/modules/`(백엔드 도메인 모듈), `pkg/`(플랫폼 인프라). 작성일 2026-06-11.
> 불확실한 항목은 "(코드 확인 필요)"로 표기 — 추측으로 단정하지 않는다. ([[harness-principles]])

## 분석 방법
- **사용자 대면 기능** = 프론트 라우트(`routes.ts`)에서 추출.
- **백엔드 기능** = `pkg/modules/<도메인>` (Community) + `ee/modules/` (Enterprise).
- **플랫폼 레이어** = 기능을 떠받치는 횡단 인프라(`pkg/` 루트).
- 각 기능에 **에디션**(Community `pkg/` / Enterprise `ee/`) 표기.

---

## 1. 기능 영역 지도 (라우트 ↔ 백엔드)

| # | 기능 영역 | 주요 라우트 (frontend) | 백엔드 모듈/패키지 | 에디션 |
|---|-----------|------------------------|---------------------|--------|
| 1 | **APM / Services** | `APPLICATION`, `SERVICE_METRICS`, `SERVICE_TOP_LEVEL_OPERATIONS`, `SERVICE_MAP` | `modules/services`, `modules/apdex`, `modules/spanpercentile` | Community |
| 2 | **Traces** | `TRACE`, `TRACES_EXPLORER`, `TRACE_DETAIL`(V2/V3), `TRACES_SAVE_VIEWS` | `modules/tracedetail`, `modules/spanmapper`, `telemetrytraces` | Community |
| 3 | **Trace Funnels** | `TRACES_FUNNELS`, `TRACES_FUNNELS_DETAIL` | `modules/tracefunnel` | Community |
| 4 | **Logs** | `LOGS`, `LOGS_EXPLORER`, `OLD_LOGS_EXPLORER`, `LIVE_LOGS`, `LOGS_INDEX_FIELDS`, `LOGS_SAVE_VIEWS` | `telemetrylogs`, `modules/fields`, `modules/savedview` | Community |
| 5 | **Logs Pipelines** | `LOGS_PIPELINES` | `modules/logspipeline` | Community |
| 6 | **Metrics Explorer** | `METRICS_EXPLORER`(+EXPLORER/VIEWS) | `modules/metricsexplorer`, `telemetrymetrics` | Community |
| 7 | **Meter** | `METER`(+EXPLORER/VIEWS) | `telemetrymeter`, `metercollector`, `meterreporter` | Community |
| 8 | **Dashboards** | `ALL_DASHBOARD`, `DASHBOARD`, `DASHBOARD_WIDGET`, `PUBLIC_DASHBOARD` | `modules/dashboard` + **`ee/modules/dashboard`** | Both |
| 9 | **Alerts** | `LIST_ALL_ALERT`, `ALERTS_NEW`, `EDIT_ALERTS`, `ALERT_HISTORY`, `ALERT_OVERVIEW` | `alertmanager`, `ruler`, `modules/rulestatehistory` | Community |
| 10 | **Alert Channels** | `CHANNELS_NEW`, `ALL_CHANNELS` | `alertmanager` (receivers) | Community |
| 11 | **Exceptions** | `ALL_ERROR`, `ERROR_DETAIL` | `telemetrytraces` (error events) (코드 확인 필요) | Community |
| 12 | **Infra Monitoring** | `INFRASTRUCTURE_MONITORING_HOSTS`, `_KUBERNETES` | `modules/inframonitoring` | Community |
| 13 | **Messaging Queues** | `MESSAGING_QUEUES_KAFKA`, `_CELERY_TASK`, `_OVERVIEW`, `_KAFKA_DETAIL` | (querier 기반 도메인 뷰) (코드 확인 필요) | Community |
| 14 | **API Monitoring** | `API_MONITORING` | `modules/thirdpartyapi` | Community |
| 15 | **Integrations / Cloud** | `INTEGRATIONS`, `INTEGRATIONS_DETAIL` | `modules/cloudintegration` + **`ee/modules/cloudintegration`** | Both |
| 16 | **AI Assistant** | `AI_ASSISTANT` | `modules/llmpricingrule` (관련) (코드 확인 필요) | Community |
| 17 | **Onboarding / Home** | `HOME`, `GET_STARTED`, `GET_STARTED_WITH_CLOUD`, `ONBOARDING` | `modules/organization`, `modules/preference` | Community |
| 18 | **Settings / Admin** | `SETTINGS`, `USAGE_EXPLORER`, `LIST_LICENSES` | `modules/retention`, `modules/quickfilter`, `modules/rawdataexport`, `licensing` | Community(+licensing) |
| 19 | **Auth / Identity** | `LOGIN`, `SIGN_UP`, `FORGOT_PASSWORD`, `PASSWORD_RESET` | `authn`, `authz`, `identn`, `modules/user`, `modules/session`, `modules/authdomain` | Community |
| 20 | **Service Accounts** | (Settings 하위) | `modules/serviceaccount` | Community |
| 21 | **Workspace / Billing** | `WORKSPACE_LOCKED`, `_SUSPENDED`, `_ACCESS_RESTRICTED` | `licensing`, `zeus`(ee) | Both |

---

## 2. 백엔드 도메인 모듈 (`pkg/modules/`) — 전수

| 모듈 | 추정 역할 | 비고 |
|------|-----------|------|
| `apdex` | APM Apdex 점수 임계값 설정 | 서비스별 만족도 지표 |
| `authdomain` | 인증 도메인 (SSO/SAML 도메인 매핑) | |
| `cloudintegration` | 클라우드(AWS/Azure 등) 통합 | EE 미러 존재 |
| `dashboard` | 대시보드 CRUD | EE 미러 존재 |
| `fields` | 텔레메트리 필드(속성) 메타데이터 | 로그/트레이스 속성 |
| `inframonitoring` | 호스트/K8s/클라우드 인프라 메트릭 | |
| `llmpricingrule` | LLM 토큰 가격 규칙 | AI/비용 관련 |
| `logspipeline` | 로그 처리 파이프라인(파서/프로세서) | |
| `metricsexplorer` | 메트릭 탐색·메타데이터 | |
| `organization` | 조직(테넌트) 관리 | |
| `preference` | 사용자/조직 환경설정 | |
| `promote` | (코드 확인 필요) | 역할 미확정 |
| `quickfilter` | 탐색 화면 빠른 필터 설정 | |
| `rawdataexport` | 원시 관측 데이터 내보내기 | |
| `retention` | 데이터 보존(TTL) 정책 | ClickHouse TTL |
| `rulestatehistory` | 알림 규칙 상태 변화 이력 | |
| `savedview` | 저장된 탐색 뷰 (로그/트레이스) | |
| `serviceaccount` | 서비스 계정(머신 토큰) | |
| `services` | APM 서비스 목록·메트릭 | |
| `session` | 로그인 세션 | |
| `spanmapper` | 스팬 → 도메인 모델 매핑 | (코드 확인 필요) |
| `spanpercentile` | 스팬 지연 백분위 계산 | p50/p95/p99 |
| `tag` | 태그 관리 | |
| `thirdpartyapi` | 외부 API 모니터링 | API Monitoring 화면 |
| `tracedetail` | 트레이스 상세 조회 | |
| `tracefunnel` | 트레이스 퍼널 분석 | |
| `user` | 사용자 CRUD·권한 | |

> EE 미러(`ee/modules/`): `cloudintegration`, `dashboard` — Community 모듈의 엔터프라이즈 변형.

---

## 3. 플랫폼 / 인프라 레이어 (`pkg/` 루트) — 기능을 떠받침

| 분류 | 패키지 | 역할 |
|------|--------|------|
| **질의 엔진** | `querier`, `querybuilder`, `queryparser` | 관측 데이터 질의·쿼리빌더·파싱 |
| **텔레메트리 저장/조회** | `telemetrystore`, `telemetrylogs`, `telemetrytraces`, `telemetrymetrics`, `telemetrymeter`, `telemetrymetadata`, `telemetryresourcefilter` | 시그널별 ClickHouse 접근 |
| **알림** | `alertmanager`, `ruler` | 알림 평가·라우팅·발송 |
| **메타스토어** | `sqlstore`, `sqlmigration`, `sqlmigrator`, `sqlschema` | 메타데이터 DB·마이그레이션 |
| **인증/인가** | `authn`, `authz`, `identn`, `licensing` | 인증·권한·라이선스 |
| **구성/조립** | `factory`, `config`, `signoz`, `apiserver`, `http` | DI·설정·앱 와이어링·HTTP |
| **공통** | `cache`, `errors`, `instrumentation`, `sharder`, `prometheus`, `valuer`, `types` | 캐시·에러·계측·샤딩 등 |
| **분석/리포트** | `analytics`, `statsreporter`, `meterreporter`, `metercollector`, `auditor`, `telemetryaudit` | 사용량·감사·미터링 |
| **EE 전용** | `ee/zeus`, `ee/anomaly`, `ee/gateway`, `ee/querier` 등 | 엔터프라이즈 게이트웨이·이상탐지 |

---

## 4. 관측 파이프라인 관점 분류

SigNoz 의 모든 기능은 **수집 → 저장 → 질의 → 시각화 → 알림** 파이프라인 중 하나에 속한다:

```
[수집] OTel Collector  →  [저장] ClickHouse + 메타스토어
                              │
        ┌─────────────────────┼─────────────────────┐
   [질의] querier        [시각화] 대시보드/탐색기      [알림] ruler/alertmanager
        │                     │                          │
   Logs/Traces/Metrics   APM·Infra·MQ·API 뷰         규칙·채널·이력
```

---

## 5. 분석에서 도출한 후보 (Phase 3 참고)

> 실제 구현 전 `/analyze-feature`로 재확인 필요. 여기서는 "분석 중 눈에 띈 지점"만 기록.

- **버전 혼재**: Logs Explorer(`OLD_LOGS_EXPLORER` vs `LOGS_EXPLORER`), Dashboard(`DashboardPage` vs `DashboardPageV2`), Trace Detail(V2/V3 게이팅, `routes.ts:142` 주석) → 신규/구버전 공존. 정리·전환 작업 후보.
- **SavedView 공통화**: 로그·트레이스가 각각 저장뷰를 가짐(`modules/savedview`) → 일관성 점검 후보.
- **QuickFilter 확장**: `modules/quickfilter` 가 어느 탐색 화면까지 적용되는지 → 기능 확장 후보.
- **신규 기능 여지**: 탐색기(Explorer) 패턴이 Logs/Traces/Metrics/Meter 에 반복 → 공통 패턴 위 신규 시그널 뷰 추가 용이.

## 다음 단계
- Phase 2: 위 기능 영역별 **테스트 케이스** 작성 → `docs/harness/test-cases/`.
- Phase 3: 후보 중 1개 선정 → `/create-spec` → 구현.

관련: [architecture.md](./architecture.md) · [glossary.md](./glossary.md) · `.claude/steering/product.md`
