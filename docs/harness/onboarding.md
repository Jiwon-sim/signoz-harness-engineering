# Onboarding — 신규 기여자 가이드

이 저장소(하네스 적용 SigNoz 포크)에서 처음 작업하는 사람을 위한 출발점.

## 0. 사전 준비 (도구)
| 도구 | 버전 | 비고 |
|------|------|------|
| Go | 1.25.7 | `go.mod` 기준 |
| Node | ≥ 22 | |
| pnpm | 10.x | **유일 허용** 패키지 매니저 (npm/yarn 금지) |
| Docker | 최신 | ClickHouse·otel-collector 로컬 기동 |
| make | - | Makefile 타깃 실행 |

## 1. 저장소 구조 한눈에
```
cmd/        진입점 (community / enterprise)
pkg/        Community 백엔드 (Apache 2.0)
ee/         Enterprise 백엔드 (상용)
frontend/   React/TS 웹앱
deploy/     Docker / swarm 배포
tests/      pytest 통합·E2E
.claude/    ★ 하네스 (steering/specs/commands/agents/hooks)
docs/harness/ ★ 하네스 사람용 문서 (여기)
```
자세히: `.claude/steering/structure.md`, [architecture.md](./architecture.md).

## 2. 로컬 개발 환경 띄우기
```bash
make devenv-up              # ClickHouse + otel-collector
make go-run-community       # 백엔드(커뮤니티) 실행
cd frontend && pnpm install && pnpm dev   # 프론트 개발 서버
```

## 3. 하네스 작업 방식 (중요)
이 저장소는 **spec-first** 로 일한다. 큰 기능은 코드보다 스펙을 먼저 쓴다.
1. `/analyze-feature <대상>` — 기존 코드 사실 파악
2. `/create-spec <기능명>` — requirements(EARS) → design → tasks (단계별 승인)
3. 구현 — phase 단위(5파일 이하), steering 규칙 준수
4. `/gen-tests <기능명>` — 테스트 케이스 생성
5. 검증 — 빌드/린트/테스트 통과 후 완료

전체 흐름: [harness-workflow.md](./harness-workflow.md).

## 4. 반드시 지킬 규칙 (자주 걸림)
- **Go 에러**: `pkg/errors` 만. 표준 `errors`/`fmt.Errorf` 금지.
- **Go 로깅**: `slog` + snake_case 키. `zap` 금지.
- **FE**: 파일 1개=컴포넌트 1개, 300 LOC 이하, barrel 파일 금지, API 는 react-query.
- **생성물 직접 수정 금지**: `frontend/src/api/generated` 등 (훅이 차단함).
- **커밋**: Conventional Commits (`feat(scope): ...`). `main` 직접 커밋 금지.

## 5. 변경 전/후 검증
- 백엔드: `make go-test` · `golangci-lint run` · `make go-build-community`
- 프론트: `pnpm tsgo --noEmit` · `pnpm lint:js` · `pnpm build` · `pnpm jest`

## 6. 막히면
- 규칙 출처가 궁금하면 → `.claude/steering/` 해당 파일.
- 용어가 낯설면 → [glossary.md](./glossary.md).
- 기여 직전 점검 → [contribution-checklist.md](./contribution-checklist.md).
