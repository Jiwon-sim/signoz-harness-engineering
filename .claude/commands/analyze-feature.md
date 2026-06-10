---
description: 기존 기능/코드를 분석해 동작·의존성·테스트 공백 리포트
argument-hint: <경로 또는 기능명>
---

# /analyze-feature — 기존 코드 분석

분석 대상: **$ARGUMENTS**

너는 신규 기능 추가 또는 스펙 작성 **전에** 사실을 수집한다. 추측 금지, 실제 코드만 인용한다.
참고: `.claude/steering/structure.md`, `.claude/steering/testing.md`.

## 수행 항목

1. **위치 파악**
   - `$ARGUMENTS` 가 가리키는 코드를 찾는다 (Grep/Glob). 백엔드(`pkg/`/`ee/`)·프론트(`frontend/src/`) 양쪽 확인.
   - 에디션(Community/Enterprise) 판별.

2. **동작 분석**
   - 진입점 → 핵심 로직 → 데이터 저장(ClickHouse/메타스토어) → 응답 흐름을 정리한다.
   - 관련 API 엔드포인트, 주요 타입/인터페이스 식별.

3. **의존성 매핑**
   - 이 코드가 의존하는 모듈, 이 코드에 의존하는 호출처를 나열한다.
   - 외부 라이브러리·OTel·DB 의존 표시.

4. **테스트 공백**
   - 기존 테스트(`*_test.go`, `*.test.tsx`, `tests/`)를 찾는다.
   - 어떤 동작이 **테스트되지 않는지** 명시 (회귀 위험 큰 경로 우선).

## 출력 (리포트)
```
## 분석: $ARGUMENTS
- 위치 / 에디션:
- 동작 요약:
- 의존성 (in/out):
- 기존 테스트:
- 테스트 공백 (우선순위):
- 권장 다음 단계: (/create-spec 또는 /gen-tests)
```
파일은 만들지 않고 리포트만 제시한다 (필요 시 사용자가 스펙화 요청).
