# SigNoz — Claude Code Harness

Kiro식 spec-driven(Steering→Specs→Tasks)을 Claude Code로 구현한 SigNoz 저장소.
**이 파일은 매 세션 가장 먼저 자동 로드되는 진입점**입니다.

## Steering — 항상 참고하는 규칙 (자동 로드)

@.claude/steering/product.md
@.claude/steering/tech.md
@.claude/steering/structure.md
@.claude/steering/backend-go.md
@.claude/steering/frontend-react.md
@.claude/steering/testing.md
@.claude/steering/ecc.md

## Principles - 하네스 원칙 (가장 우선)

1. **Spec 우선** — 비자명 기능은 코드 전에 `requirements(EARS) → design → tasks`.
2. **사실 기반** — 버전·경로·컨벤션은 실제 파일에서 확인·인용. 추측 금지.
3. **검증 필수** — "완료" 전 빌드·린트·테스트를 실제 실행. 실패는 실패로 보고.
4. **작은 단위** — 한 응답 5파일 이하. 멀티파일은 phase로 분할.
5. **추적성** — REQ ↔ design ↔ TASK ↔ TC ↔ 커밋을 ID로 연결.
6. **경계** — Community(`pkg/`)와 EE(`ee/`) 분리, 생성물 직접 수정 금지. 단 린트 제외 구역(`query-service`)은 그 위치의 기존 코드 컨벤션 우선.

## Workflow

analyze → create-spec → implement → gen-tests → verify → review

> **review**: 새 로직·여러 파일·API·보안·DB 변경이면 `/code-review`(AI 자동, 기술 품질) → 사람 승인(도메인·보안 정책). 오타·주석·한 줄 수정은 생략. verify(빌드·린트·테스트 통과) 뒤에 둔다.

## Commands

- `/analyze-feature <대상>`: 기존 코드 분석 — 동작·의존성·테스트 공백 (사실 수집)
- `/create-spec <기능>`: `requirements → design → tasks` 스펙 문서 생성
- `/gen-tests <기능>`: 스펙 기반 테스트 케이스 생성 및 실제 실행
- `/ecc <작업>`: ECC 7단계 품질 절차 수행 (보고상 게이트, 기준: `.claude/steering/ecc.md`)

## Sub-Agents — 언제 무엇을 부르나

| 에이전트 | 용도 | 호출 시점 |
|----------|------|-----------|
| `go-implementer` | 백엔드 Go 구현 (pkg/errors·slog·에디션 분리) | 비자명 `pkg/`·`ee/` 변경 |
| `react-implementer` | 프론트 구현 (react-query·@signozhq/ui) | 비자명 `frontend/` 변경 |
| `code-reviewer` | **보안 검토 전담** (읽기 전용, 수정 안 함) — ECC 5단계 | verify 통과 후 |
| `playwright-test-*` | E2E 작성·치유 (업스트림 자산) | Playwright MCP 연결 시에만 (현재 보류) |

> 흐름: 구현은 implementer 에이전트에 위임 → verify(빌드·린트·테스트) → `code-reviewer`(보안, ECC 5) → `/code-review`(빌트인, 일반 리뷰, ECC 6) → 사람 승인.
> 일반 코드 리뷰는 빌트인 `/code-review`를 쓰고, `code-reviewer` 에이전트는 보안에만 사용한다 (역할 겹침 방지).

## MCP

- `context7` — 라이브러리 최신 문서 조회 (`.mcp.json`). **활성화는 사용자가 직접**: 세션에서 승인 프롬프트에 동의 후 리로드해야 연결됨.
- Playwright MCP는 E2E 단계에서만 — `.claude/settings.local.json`에 `mcp__playwright-test__*` 권한을 추가하고 Claude MCP 설정에 서버를 등록한 뒤 사용. (현재 보류)

