# Git Workflow — 브랜치 · 커밋 · PR

## 브랜치
- 기본 브랜치: `main`.
- 작업은 항상 **새 브랜치**에서. `main` 에 직접 커밋하지 않는다.
- 브랜치명: `feat/<요약>`, `fix/<요약>`, `chore/<요약>` 등.

## 커밋 메시지 — Conventional Commits (강제)
- 프론트엔드에 `commitlint` + `@commitlint/config-conventional` 설정됨.
- 형식: `type(scope): subject`
  - 예: `feat(traces): add trace detail copy button`
  - 예: `fix(querier): handle empty result set`
- 주요 type: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`, `build`.
- scope 는 도메인/모듈명 (traces, logs, querier, infra-monitoring 등 — 실제 커밋 히스토리 참고).

## Pre-commit 훅 (husky + lint-staged, frontend)
변경 파일에 대해 자동 실행:
- `tsgo --noEmit` (타입 체크)
- `oxlint --fix` + `oxfmt --write`
- `stylelint` (scss/css)
훅을 `--no-verify` 로 우회하지 않는다 (사용자가 명시 요청한 경우 제외).

## Pull Request
- PR 단위는 작게. 한 PR = 한 가지 논리적 변경.
- PR 본문: 무엇을·왜·어떻게 검증했는지. 관련 스펙(`.claude/specs/<기능>`) 링크.
- 커밋·푸시는 **사용자가 요청할 때만** 수행한다.

## 하네스 연계
- 비자명 기능은 `/create-spec` 으로 스펙 작성 → 스펙 승인 후 구현 → `/gen-tests` 로 테스트.
- 커밋은 단계(phase)별로 분리. 대규모 리팩터는 cleanup 커밋을 먼저 분리 (`frontend/AGENTS.md` Step 0).

관련: [[harness-principles]] · [[testing]]
