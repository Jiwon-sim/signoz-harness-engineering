# Structure — 디렉토리 · 모듈 구조

> 새 코드를 어디에 둘지, 기존 코드를 어디서 찾을지의 지도. 경로는 실측 기준.

## 최상위 레이아웃
```
cmd/            진입점. community/ 와 enterprise/ 빌드 타깃 분리
pkg/            Community 백엔드 핵심 (Apache 2.0)
ee/             Enterprise 백엔드 (상용 라이선스) — pkg/ 와 미러링되는 구조
frontend/       React/TS 웹 앱
deploy/         Docker / docker-swarm 배포
tests/          Python pytest 통합·E2E (e2e/, integration/, fixtures/, seeder/)
conf/           기본 설정 파일
docs/           제품·설정 문서
scripts/        빌드·운영 스크립트
.claude/        ★ 하네스 (steering/specs/commands)
```

## 백엔드 모듈 패턴 (`pkg/`)
- 기능은 **도메인 모듈** 단위로 `pkg/modules/<도메인>/` 에 위치.
  예: `apdex`, `dashboard`, `inframonitoring`, `logspipeline`, `metricsexplorer`, `organization`, `cloudintegration`.
- 횡단 인프라는 루트 `pkg/` 에: `sqlstore`, `cache`, `alertmanager`, `querier`, `ruler`, `telemetrylogs` 등.
- 구성·조립: `pkg/factory`(DI), `pkg/config`, `pkg/signoz`(앱 와이어링).
- **EE 미러링**: 엔터프라이즈 변형은 `ee/modules/`, `ee/querier/` 등 `pkg/` 와 같은 이름으로 둔다.

## 프론트엔드 레이아웃 (`frontend/src/`)
| 폴더 | 용도 |
|------|------|
| `pages/` | 라우트 단위 페이지 |
| `container/` | 페이지를 구성하는 큰 컨테이너 컴포넌트 |
| `components/` | 재사용 가능한 작은 컴포넌트 |
| `modules/` | 도메인 기능 모듈 |
| `api/` | API 호출 (`api/generated/` = orval 자동 생성, 직접 수정 금지) |
| `hooks/` | 공용 커스텀 훅 |
| `store/` | Redux/Zustand 상태 |
| `providers/` | React Context provider |
| `utils/`, `lib/`, `constants/`, `types/` | 유틸·상수·타입 |
| `__tests__/`, `tests/` | 테스트 |

## 신규 코드 배치 규칙
1. 백엔드 기능 → 해당 도메인 `pkg/modules/<도메인>/`. 없으면 새 모듈 디렉토리 신설 후 factory 등록.
2. 프론트 기능 → 페이지는 `pages/`, 로직 큰 묶음은 `container/`, 재사용 조각은 `components/`.
3. 컴포넌트는 **파일 1개당 컴포넌트 1개**, 300 LOC 초과 금지, **barrel 파일 금지** (`frontend/AGENTS.md`).
4. 자동 생성물(`api/generated`, 마이그레이션 일부)은 직접 수정하지 않는다.

## 하네스 산출물 배치
- 항상 참고 규칙 → `.claude/steering/` · 하네스 원칙 → `CLAUDE.md`
- 기능 스펙 → `.claude/specs/<기능명>/{requirements,design,tasks}.md`
- 테스트 케이스 → `.claude/specs/<기능명>/test-cases.md` (템플릿: `.claude/specs/_template/test-case-template.md`)

