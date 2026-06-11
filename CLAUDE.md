# SigNoz — Claude Code Harness

이 저장소는 **Claude Code 기반 하네스 엔지니어링(Harness Engineering)** 구조를 적용한 SigNoz 포크입니다.
Kiro의 spec-driven 방법론(Steering → Specs → Tasks)을 차용하되, 구현은 Claude Code 네이티브 기능
(`@import` 자동 로드, 슬래시 커맨드, 서브에이전트, 훅)으로 합니다.

> **항상 이 파일이 먼저 로드됩니다.** 아래 `@import` 된 steering 파일들이 "이 프로젝트에서 작업할 때
> 반드시 지켜야 하는 규칙"입니다. 작업 전 관련 steering을 확인하세요.

---

## Steering (항상 참고하는 규칙)

@.claude/steering/product.md
@.claude/steering/tech.md
@.claude/steering/structure.md
@.claude/steering/backend-go.md
@.claude/steering/frontend-react.md
@.claude/steering/database.md
@.claude/steering/testing.md
@.claude/steering/git-workflow.md
@.claude/steering/harness-principles.md

---

## 하네스 워크플로우 (슬래시 커맨드)

| 커맨드 | 용도 |
|--------|------|
| `/create-spec <기능명>` | 요구사항(EARS) → 설계 → 태스크 스펙을 `.claude/specs/<기능명>/` 에 생성 |
| `/analyze-feature <경로\|기능명>` | 기존 코드 분석 후 동작·의존성·테스트 공백 리포트 |
| `/gen-tests <기능명>` | 스펙 기반으로 기능별 테스트 케이스 생성 |

## 디렉토리 지도

```
CLAUDE.md                 ← 진입점 (이 파일)
.claude/
├── steering/             ← 항상 참고 규칙 (위 @import 대상)
├── specs/                ← 기능별 스펙 (requirements/design/tasks)
│   └── _template/        ← 스펙 템플릿
├── commands/             ← 하네스 워크플로우 슬래시 커맨드
├── agents/               ← 서브에이전트 (Playwright 등)
└── settings.json         ← 플러그인 · 훅 설정
docs/harness/             ← 사람용 가이드 문서 (요구사항/아키텍처)
```

## 핵심 원칙 (요약 — 자세한 내용은 harness-principles.md)

1. **Spec 우선**: 비자명한 기능은 코드보다 스펙(requirements/design/tasks)을 먼저 작성한다.
2. **사실 기반**: 추측 금지. 버전·컨벤션은 항상 실제 설정 파일에서 확인한다.
3. **검증 필수**: "완료" 보고 전 빌드·린트·테스트를 실제로 실행한다.
4. **작은 단위**: 한 번에 5개 파일 이하, 단계별로 진행한다.
