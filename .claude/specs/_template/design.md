# Design — <기능명>

> requirements.md 의 REQ-* 를 어떻게 구현할지. 상태: Draft | Approved · 작성일: YYYY-MM-DD

## 1. 개요
<설계 접근 요약. 핵심 결정 1~3가지.>

## 2. 아키텍처
- 영향 받는 레이어: [ ] Frontend  [ ] Backend(pkg)  [ ] Enterprise(ee)  [ ] DB(ClickHouse/메타스토어)
- 컴포넌트/모듈 배치 (→ [[structure]] 규칙 준수):
  - 백엔드: `pkg/modules/<도메인>/...`
  - 프론트: `pages|container|components/...`
- 다이어그램 (선택):
```
<요청 흐름 / 데이터 흐름 ASCII>
```

## 3. 데이터 모델 / 스키마
- 메타스토어 변경? → 마이그레이션 필요 (`pkg/sqlmigration`). Postgres+SQLite 호환 확인. ([[database]])
- ClickHouse 스키마/쿼리 영향?
- API 스키마 변경? → orval 재생성 (`pnpm generate:api`).

## 4. API / 인터페이스
| 메서드 | 경로 | 요청 | 응답 | 인증 |
|--------|------|------|------|------|
| | | | | |

## 5. 주요 흐름 / 로직
<단계별 처리. 에러 처리는 `pkg/errors`, 로깅은 slog. ([[backend-go]])>

## 6. 에러 처리 · 엣지 케이스
- <빈 입력 / 권한 없음 / 동시성 / 대용량 등>

## 7. 설계 결정 · 대안 (ADR-lite)
| 결정 | 대안 | 선택 이유 |
|------|------|-----------|
| | | |

## 8. 테스트 전략 (이 기능)
- 단위/통합/E2E 중 무엇으로 어떤 REQ 를 덮는가. ([[testing]])

## 9. 추적
| 설계 섹션 | 충족 요구사항 |
|-----------|----------------|
| §2 | REQ-1 |
