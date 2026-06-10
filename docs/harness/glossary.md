# Glossary — 용어집

하네스·SigNoz 작업에서 자주 쓰는 용어. (도메인 신규 진입자용)

## 관측가능성 (Observability)
| 용어 | 설명 |
|------|------|
| **Observability** | 시스템 외부 출력(로그·메트릭·트레이스)으로 내부 상태를 추론하는 능력 |
| **Telemetry** | 시스템이 내보내는 관측 데이터의 총칭 |
| **Logs** | 시점별 이벤트 기록 (텍스트/구조화) |
| **Metrics** | 수치 시계열 (counter, gauge, histogram 등) |
| **Traces** | 분산 요청의 전파 경로. 여러 **span** 으로 구성 |
| **Span** | 트레이스 내 단일 작업 단위 (시작·종료·속성) |
| **APM** | Application Performance Monitoring. latency·error·throughput |
| **Flamegraph** | 트레이스/프로파일을 계층 막대로 시각화 |
| **Exception** | 추적된 예외(에러) 이벤트 |

## OpenTelemetry
| 용어 | 설명 |
|------|------|
| **OpenTelemetry (OTel)** | 관측 데이터 수집의 오픈 표준. SigNoz 의 수집 표준 |
| **OTel Collector** | 텔레메트리를 수신·가공·전달하는 에이전트 (signoz-otel-collector) |
| **Semantic Conventions** | 속성 이름 표준 규약 (예: `service.name`, `http.status_code`) |
| **Instrumentation** | 앱에 OTel 계측을 추가하는 것 |

## SigNoz 아키텍처
| 용어 | 설명 |
|------|------|
| **ClickHouse** | 컬럼형 DB. 로그·메트릭·트레이스의 핵심 저장소 |
| **메타스토어(Metastore)** | 대시보드·알림규칙·사용자 등 메타데이터 저장 (Postgres/SQLite) |
| **Query Service** | 쿼리·API 를 처리하는 백엔드 (`pkg/query-service`) |
| **Querier** | 관측 데이터 질의 추상화 (`pkg/querier`) |
| **Query Builder** | UI 에서 쿼리를 조립하는 컴포넌트 |
| **Alertmanager** | 알림 라우팅·발송 (`pkg/alertmanager`) |
| **Ruler** | 알림 규칙 평가 (`pkg/ruler`) |
| **Community / Enterprise(EE)** | `pkg/`(Apache 2.0) vs `ee/`(상용) 에디션 |

## 하네스 / 방법론
| 용어 | 설명 |
|------|------|
| **Harness Engineering** | AI 작업을 위한 컨텍스트·워크플로우·검증 틀을 코드베이스에 심는 것 |
| **Steering** | 항상 참고하는 규칙 문서 (`.claude/steering/`, @import 자동 로드) |
| **Spec** | 기능별 requirements/design/tasks 묶음 (`.claude/specs/<기능>`) |
| **EARS** | Easy Approach to Requirements Syntax. 요구사항 표기법 |
| **REQ / AC / TC** | 요구사항 ID / 수용기준(Acceptance Criteria) / 테스트 케이스 |
| **Traceability** | REQ↔design↔task↔test↔commit 상호 참조 추적성 |
| **Slash Command** | `.claude/commands/` 의 워크플로우 명령 (`/create-spec` 등) |
| **Hook** | 도구 실행 시점에 자동 실행되는 검사 (`.claude/settings.json`) |

## 기술 스택 약어
| 용어 | 설명 |
|------|------|
| **orval** | OpenAPI → react-query 훅/타입 코드 생성기 |
| **react-query** | 서버 상태 관리 라이브러리 |
| **Zustand** | 경량 클라이언트 상태 관리 (신규 표준) |
| **pnpm** | 이 저장소의 유일 허용 패키지 매니저 |
| **Vite (rolldown)** | 프론트엔드 빌드 도구 |
| **golangci-lint** | Go 린터 집합 (`.golangci.yml`) |

## 관련
- 제품 개요: `.claude/steering/product.md`
- 아키텍처: [architecture.md](./architecture.md)
