# Harness Principles — 하네스 엔지니어링 원칙

이 저장소의 **작업 방식 자체**를 규정한다. 모든 steering 중 가장 우선한다.

## 하네스 엔지니어링이란
AI 에이전트(Claude)가 일관되고 검증 가능하게 일하도록, **컨텍스트·워크플로우·검증을
구조화한 틀(harness)** 을 코드베이스에 심는 것. Kiro 의 spec-driven 철학을 Claude Code
네이티브 기능으로 구현한다.

## 3계층 모델 (Steering → Specs → Tasks)
```
Steering  (.claude/steering/)   "항상" 참고하는 규칙·맥락        ← 자동 로드(@import)
   │
Specs     (.claude/specs/<기능>) 기능별 requirements/design/tasks ← /create-spec
   │
Tasks     (specs/<기능>/tasks.md) 실행 가능한 작업 + 테스트 추적  ← /gen-tests
```

## 핵심 원칙
1. **Spec 우선 (Spec-first)**
   - 비자명한 기능은 코드보다 **requirements → design → tasks** 를 먼저 쓴다.
   - 요구사항은 **EARS 형식**으로 명세 (→ `docs/harness/requirements-guide.md`).
   - 각 요구사항은 테스트 케이스로 추적된다 (traceability).

2. **사실 기반 (No guessing)**
   - 버전·경로·컨벤션은 **실제 파일에서 확인**하고 인용한다. 기억/추측으로 단정하지 않는다.
   - 불확실하면 "확인 필요"로 표시하고 검증한다.

3. **검증 필수 (Forced verification)**
   - "완료" 보고 전 반드시 실제로: 타입체크 → 린트 → 빌드 → 테스트.
   - 도구의 "쓰기 성공"은 컴파일/통과 보장이 아니다.
   - 실패하면 실패라고 출력과 함께 보고한다. 건너뛴 단계는 건너뛰었다고 말한다.

4. **작은 단위·단계적 (Phased, small)**
   - 한 응답에서 5개 파일 이하. 멀티파일 리팩터는 phase 로 쪼갠다.
   - 각 단계마다 사용자에게 **무엇을·왜** 하는지 알리고 진행한다.

5. **추적성 (Traceability)**
   - 요구사항 ↔ 설계 ↔ 태스크 ↔ 테스트 ↔ 커밋이 서로 참조되도록 링크한다.

6. **에디션·경계 인식**
   - Community(`pkg/`) 와 Enterprise(`ee/`) 경계를 지킨다. 자동 생성물은 직접 수정 금지.

## 기존 코드에 기능 추가하는 표준 절차
1. `/analyze-feature <대상>` — 기존 동작·의존성·테스트 공백 파악 (사실 수집).
2. `/create-spec <기능명>` — requirements(EARS) → design → tasks 작성, 사용자 승인.
3. 구현 — phase 단위, steering 규칙 준수.
4. `/gen-tests <기능명>` — 기능별 테스트 케이스 생성·실행.
5. 검증 — 빌드/린트/테스트 통과 확인 후 완료 보고.

## 안티패턴 (하지 말 것)
- 스펙 없이 큰 기능을 바로 코딩. · 검증 없이 "완료" 보고. · 추측으로 버전/경로 단정.
- 한 번에 거대한 멀티파일 변경. · steering 규칙(에러/로깅/컴포넌트 규칙) 위반.

관련: [[product]] · [[testing]] · [[git-workflow]] · 가이드: `docs/harness/`
