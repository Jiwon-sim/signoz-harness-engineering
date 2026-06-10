# Harness Workflow — Steering → Spec → Task

하네스에서 **기능 하나를 추가하는 전체 흐름**. 각 단계의 입력·산출물·검증 게이트를 정의한다.

## 전체 흐름도
```
[사실 수집]        [스펙 작성]              [구현]            [테스트]         [검증·완료]
/analyze-feature → /create-spec ─────────→ phase 구현 ────→ /gen-tests ───→ build/lint/test
   │                  │                       │                 │               │
   기존 동작·         requirements(EARS)      steering 규칙      REQ↔TC          실패 시
   의존성·            → design                준수, 5파일/phase  추적            실패 보고
   테스트 공백        → tasks (승인마다 정지)
```

## 단계 상세

### 1. 사실 수집 — `/analyze-feature <대상>`
- **목적**: 추측 제거. 기존 동작·의존성·테스트 공백을 실제 코드에서 확인.
- **산출물**: 분석 리포트 (파일 생성 없음).
- **게이트**: 대상 코드 위치·에디션(Community/EE) 확정.

### 2. 스펙 작성 — `/create-spec <기능명>`
- **2a. requirements.md** — EARS 형식, REQ-ID + 수용기준(AC). → **사용자 승인 후** 진행.
- **2b. design.md** — 아키텍처·데이터모델·API·테스트전략, REQ 추적. → 승인.
- **2c. tasks.md** — 실행 TASK 분해 (5파일/태스크), 검증 게이트.
- **산출물**: `.claude/specs/<기능명>/{requirements,design,tasks}.md`
- **게이트**: 각 문서 사용자 승인. 미승인 시 다음 문서로 진행 금지.

### 3. 구현 (Phase 단위)
- tasks.md 의 Phase 순서대로. **한 Phase = 5파일 이하**.
- steering 규칙 준수: 에러=`pkg/errors`, 로깅=`slog`, FE 컴포넌트 규칙 등.
- 동작 변경 시 기존 테스트 단언을 먼저 갱신.
- **게이트**: 각 Phase 끝에 빌드+단위테스트 통과 후 다음 Phase.

### 4. 테스트 — `/gen-tests <기능명>`
- 각 REQ 의 AC → 최소 1개 테스트 케이스(TC).
- 레이어 선택: Go 단위 / FE Jest / pytest 통합 / Playwright E2E.
- **산출물**: `docs/harness/test-cases/<기능명>.md` + (승인 시) 테스트 코드.

### 5. 검증·완료
- 필수: 타입체크 → 린트 → 빌드 → 테스트 **실제 실행**.
- 실패 시 출력과 함께 실패 보고. 건너뛴 단계는 명시.
- 추적표(REQ↔design↔TASK↔TC) 최신화 후 완료.

## 추적성 매트릭스 (항상 유지)
| REQ | Design 섹션 | TASK | Test Case | 커밋 |
|-----|-------------|------|-----------|------|
| REQ-1 | §2 | TASK-1 | TC-1 | abc123 |

## 관련
- 원칙: `.claude/steering/harness-principles.md`
- 요구사항 작성: [requirements-guide.md](./requirements-guide.md)
- 테스트: [test-strategy.md](./test-strategy.md)
