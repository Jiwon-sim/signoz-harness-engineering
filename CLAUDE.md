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

## Principles - 하네스 원칙 (가장 우선)

1. **Spec 우선** — 비자명 기능은 코드 전에 `requirements(EARS) → design → tasks`.
2. **사실 기반** — 버전·경로·컨벤션은 실제 파일에서 확인·인용. 추측 금지.
3. **검증 필수** — "완료" 전 빌드·린트·테스트를 실제 실행. 실패는 실패로 보고.
4. **작은 단위** — 한 응답 5파일 이하. 멀티파일은 phase로 분할.
5. **추적성** — REQ ↔ design ↔ TASK ↔ TC ↔ 커밋을 ID로 연결.
6. **경계** — Community(`pkg/`)와 EE(`ee/`) 분리, 생성물 직접 수정 금지. 단 린트 제외 구역(`query-service`)은 그 위치의 기존 코드 컨벤션 우선.

## Workflow

analyze → create-spec → implement → gen-tests → verify

## Commands

- `/analyze-feature <대상>`: 기존 코드 분석 — 동작·의존성·테스트 공백 (사실 수집)
- `/create-spec <기능>`: `requirements → design → tasks` 스펙 문서 생성
- `/gen-tests <기능>`: 스펙 기반 테스트 케이스 생성 및 실제 실행

