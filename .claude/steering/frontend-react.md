# Frontend (React/TS) — 코딩 컨벤션

> 강제 규칙의 핵심 출처는 `frontend/AGENTS.md` + `package.json`(lint-staged). 이 문서는 그 요약·하네스 관점.

## 패키지 / 런타임
- **pnpm 전용** (npm/yarn 금지 — `only-allow pnpm`). Node ≥ 22.
- 설치: `pnpm install`. 의존성 추가는 정확한 버전 핀(레포 관행: 캐럿 없이 고정 다수).

## 파일 / 컴포넌트 규칙 (AGENTS.md)
- **파일 1개 = 컴포넌트 1개.**
- 헬퍼 함수는 같은 파일에 두지 말 것 → `utils.ts` 또는 전용 파일.
- 커스텀 훅은 별도 파일, 사용하는 컴포넌트 근처에.
- 타입 선언이 3개 초과면 별도 `types.ts`.
- **파일 300 LOC 초과 금지** → 작은 컴포넌트 + `use<Component>Callbacks` 훅으로 분리.
- **barrel 파일(index.ts 재export) 금지.**

## 데이터 페칭
- 모든 API 호출은 **react-query** 로. 수기 axios 지양.
- 먼저 `src/api/generated/` 에 orval 생성 훅/타입이 있는지 확인 후 사용.
- 생성 폴더(`api/generated`)는 직접 수정 금지. 스키마 변경은 `pnpm generate:api`.

## 테스트 가능성
- 인터랙티브/행위 컴포넌트(input, button 등)에 **`data-testid`** 부여.
- 테스트는 role 대신 testid 로 찾는다.

## 상태 관리
- 신규: **Zustand 5**. 서버 상태: **react-query**. 레거시 Redux 는 유지보수만.

## 스타일
- SCSS + styled-components. 디자인 토큰 `@signozhq/design-tokens`, UI `@signozhq/ui`, AntD 5.

## 완료 전 검증 (필수 — AGENTS.md "FORCED VERIFICATION")
```
pnpm tsgo --noEmit          # 타입 체크
pnpm lint:js --quiet        # 치명 오류
pnpm oxlint <변경파일>       # 경고 0
pnpm build                  # 빌드 통과
pnpm jest <관련 테스트>      # 해당/상위 폴더 테스트
```
도구가 파일 쓰기를 성공으로 표시해도 컴파일 보장이 아니다. 위 검증 전 "완료" 보고 금지. (하네스 원칙: `CLAUDE.md`)

## 동작 변경 시
- 기존 동작을 덮는 테스트를 먼저 식별 → 단언 갱신. 테스트 없으면 변경 **전에** 추가.

