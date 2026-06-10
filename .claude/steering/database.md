# Database — ClickHouse + 메타스토어

## 두 종류의 저장소 (혼동 주의)
| | ClickHouse | 메타스토어 (Postgres/SQLite) |
|---|---|---|
| 저장 대상 | 로그·메트릭·트레이스 (관측 시계열, 대용량) | 대시보드·알림규칙·사용자·조직 등 메타데이터 |
| 특성 | 컬럼형, append 중심, 고속 집계 | 관계형, 트랜잭션, CRUD |
| 코드 접근 | `pkg/telemetry*`, `pkg/querier` | `pkg/sqlstore`, `pkg/sqlmigrator` |
| devenv | `make devenv-clickhouse` | `make devenv-postgres` |

## ClickHouse 규칙
- 관측 데이터 질의는 **쿼리 빌더 / `pkg/querier`** 추상화를 통한다. 원시 SQL 산재 지양.
- 스키마는 시그널별 테이블 (logs, metrics, traces). OTel 시맨틱 컨벤션의 컬럼 매핑을 따른다.
- 고카디널리티 컬럼·집계는 성능 영향 큼 → 쿼리 비용을 항상 고려.

## 메타스토어 규칙
- 접근은 `pkg/sqlstore` 추상화 사용. 드라이버 직접 호출 금지.
- **스키마 변경은 반드시 마이그레이션으로**: `pkg/sqlmigration` 에 추가, `pkg/sqlmigrator` 가 적용.
  - 마이그레이션은 **앞으로만(forward-only) · 멱등** 지향. 기존 마이그레이션 수정 금지(이미 배포됨).
- Postgres 와 SQLite 양쪽에서 동작해야 한다 (방언 차이 주의).

## 데이터 변경 작업 체크리스트
1. ClickHouse 인지 메타스토어인지 먼저 분류.
2. 메타스토어 스키마 변경이면 새 마이그레이션 파일 작성.
3. 마이그레이션 롤백/재실행 안전성 확인.
4. `make devenv-up` 환경에서 실제 적용 테스트.

관련: [[tech]] · [[backend-go]] · [[structure]]
