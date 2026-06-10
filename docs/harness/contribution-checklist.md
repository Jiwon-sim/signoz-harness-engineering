# Contribution Checklist — 기여 전 점검

PR 을 올리기 전(또는 "완료" 보고 전) 이 체크리스트를 통과해야 한다.
하네스 원칙 "검증 필수"의 실천 양식. ([harness-workflow.md](./harness-workflow.md))

## A. 스펙·추적성
- [ ] 비자명 기능이면 `.claude/specs/<기능>/` 에 requirements/design/tasks 가 있다.
- [ ] 모든 REQ 가 TASK 로 구현됐다.
- [ ] 모든 AC 가 테스트 케이스(TC)로 추적된다.
- [ ] 추적표(REQ↔design↔task↔test)가 최신이다.

## B. 코드 규칙 (steering)
- [ ] Go: 에러는 `pkg/errors`, 로깅은 `slog`(snake_case), 출력문(`fmt.Print*`) 없음.
- [ ] Go: 모든 에러 처리됨(errcheck), HTTP body close, 미사용 코드 없음.
- [ ] FE: 파일 1개=컴포넌트 1개, ≤300 LOC, barrel 파일 없음.
- [ ] FE: API 호출은 react-query(+orval 생성 훅), 수기 axios 없음.
- [ ] 생성물(`api/generated` 등) 직접 수정 안 함.
- [ ] 에디션 경계 준수: Community(`pkg/`) 가 `ee/` 에 의존 안 함.

## C. DB / 마이그레이션
- [ ] 메타스토어 스키마 변경 시 새 마이그레이션 추가 (`pkg/sqlmigration`).
- [ ] Postgres·SQLite 양쪽 호환 확인.
- [ ] 기존 마이그레이션 수정 안 함(forward-only).

## D. 테스트
- [ ] 신규/변경 로직에 단위 테스트 추가.
- [ ] 동작 변경 시 기존 테스트 단언 갱신(없으면 변경 전에 추가).
- [ ] 결정성 확보(시간/랜덤/네트워크 목).

## E. 검증 실행 (실제로 돌렸는가)
백엔드:
- [ ] `make go-test` 통과
- [ ] `golangci-lint run` 통과
- [ ] `make go-build-community` (필요 시 `-enterprise`) 통과

프론트:
- [ ] `pnpm tsgo --noEmit` 통과
- [ ] `pnpm lint:js --quiet` 통과
- [ ] `pnpm oxlint <변경파일>` 경고 0
- [ ] `pnpm build` 통과
- [ ] `pnpm jest <관련 테스트>` 통과

## F. Git / PR
- [ ] 새 브랜치에서 작업(`feat/`, `fix/`, `chore/` …), `main` 직접 커밋 안 함.
- [ ] 커밋 메시지 Conventional Commits 형식.
- [ ] PR = 한 가지 논리적 변경. 본문에 무엇·왜·검증 방법 + 스펙 링크.
- [ ] pre-commit 훅을 `--no-verify` 로 우회하지 않음.

> 하나라도 실패하면 "완료"가 아니다. 실패는 출력과 함께 보고하고, 건너뛴 항목은 건너뛰었다고 밝힌다.
