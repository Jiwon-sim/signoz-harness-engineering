# Product — SigNoz 제품 개요

## 한 줄 정의
SigNoz는 **오픈소스 관측가능성(Observability) 플랫폼**으로, 로그·메트릭·트레이스(Logs, Metrics, Traces)를
단일 애플리케이션에서 수집·저장·시각화한다. Datadog / New Relic 의 오픈소스 대안.

## 핵심 가치 (작업 시 우선순위 판단 기준)
- **OpenTelemetry 네이티브**: 데이터 수집의 표준은 OTel. 새 기능은 OTel 시맨틱 컨벤션을 따른다.
- **단일 백엔드(ClickHouse)**: 세 가지 시그널을 하나의 컬럼형 DB에 저장 → 빠른 쿼리·상관분석.
- **셀프 호스팅 우선**: 사용자가 자신의 인프라에 배포. 데이터 주권이 핵심 셀링 포인트.

## 주요 기능 영역 (도메인)
| 영역 | 설명 |
|------|------|
| APM | 서비스 성능 모니터링 (latency, error rate, throughput) |
| Traces | 분산 추적, 트레이스 상세, 플레임그래프 |
| Logs | 로그 탐색·파이프라인·필터 |
| Metrics & Dashboards | 커스텀 대시보드, 패널, 쿼리 빌더 |
| Alerts | 임계치·이상탐지 기반 알림 (Alertmanager) |
| Infra Monitoring | 호스트/K8s/클라우드(Azure 등) 인프라 메트릭 |
| Exceptions | 예외 추적 |

## 에디션 구분 (매우 중요)
- **Community**: `pkg/`, `cmd/community/` — Apache 2.0, 무료.
- **Enterprise (EE)**: `ee/`, `cmd/enterprise/` — 상용 라이선스 기능.
- 코드 작업 시 **어느 에디션 대상인지 항상 확인**한다. Community 기능은 EE에 의존하면 안 된다.

## 사용자 페르소나
- **개발자/SRE**: 프로덕션 이슈를 디버깅. 빠른 쿼리·정확한 데이터가 생명.
- **플랫폼 엔지니어**: SigNoz 자체를 배포·운영.

## 제품 결정 시 참고
- 기능 추가는 "관측 데이터의 수집→저장→질의→시각화→알림" 파이프라인 중 어디에 속하는지 먼저 분류한다.
- UX 변경은 기존 쿼리 빌더 / 대시보드 패턴과 일관되어야 한다.

관련: [[tech]] · [[structure]] · [[harness-principles]]
