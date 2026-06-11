# SigNoz Harness — 하네스 엔지니어링 가이드

이 디렉토리는 **사람이 읽는** 하네스 엔지니어링 문서 모음입니다.
(AI 가 자동 로드하는 규칙은 `.claude/steering/` 에 있습니다 — 역할이 다릅니다.)

## 하네스 엔지니어링이란?
AI 에이전트(Claude)가 **일관되고 검증 가능하게** 일하도록, 컨텍스트·워크플로우·검증을 코드베이스에
구조화해 심는 것. 이 저장소는 Kiro 의 spec-driven 철학(Steering → Specs → Tasks)을 차용하되,
**Claude Code 네이티브 기능**(`@import` 자동 로드, 슬래시 커맨드, 서브에이전트, 훅)으로 구현합니다.

## 두 종류의 문서 (혼동 주의)
| | `.claude/steering/` | `docs/harness/` (여기) |
|---|---|---|
| 독자 | **AI (Claude)** — 매 세션 자동 로드 | **사람** — 기여자·리뷰어 |
| 성격 | 강제 규칙 (짧고 단정적) | 설명·가이드·합의 (배경 포함) |
| 예 | "에러는 pkg/errors 만" | "왜 그런지, 어떻게 작성하는지" |

## 3계층 모델
```
Steering  (.claude/steering/)    항상 참고하는 규칙        ← @import 자동 로드
   │
Specs     (.claude/specs/<기능>)  requirements/design/tasks ← /create-spec
   │
Tasks     (tasks.md)             실행 작업 + 테스트 추적    ← /gen-tests
```

## 문서 색인
| 문서 | 내용 |
|------|------|
| [harness-workflow.md](./harness-workflow.md) | Steering→Spec→Task 전체 워크플로우 |
| [requirements-guide.md](./requirements-guide.md) | EARS 형식 요구사항 작성법 |
| [architecture.md](./architecture.md) | SigNoz 아키텍처 개요 |
| [test-strategy.md](./test-strategy.md) | 테스트 전략 상세 |
| [templates/test-case-template.md](./templates/test-case-template.md) | 테스트 케이스 양식 |
| [glossary.md](./glossary.md) | 용어집 |
| [onboarding.md](./onboarding.md) | 신규 기여자 온보딩 |
| [contribution-checklist.md](./contribution-checklist.md) | 기여 전 체크리스트 |

## 빠른 시작
1. 기존 코드 파악: `/analyze-feature <대상>`
2. 스펙 작성: `/create-spec <기능명>` → requirements → design → tasks (단계별 승인)
3. 구현: phase 단위, steering 규칙 준수
4. 테스트: `/gen-tests <기능명>`
5. 검증: 빌드·린트·테스트 통과 후 완료

> 핵심 원칙은 `.claude/steering/harness-principles.md` 참조.
