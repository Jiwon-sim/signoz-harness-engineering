# Backend (Go) — 코딩 컨벤션

> 강제 규칙의 출처는 `.golangci.yml`. 위반 시 CI 린트가 실패한다.

## 절대 규칙 (린터가 막음)
1. **에러**: `github.com/SigNoz/signoz/pkg/errors` 만 사용.
   - ❌ 표준 `errors` import 금지 (depguard `noerrors`)
   - ❌ `fmt.Errorf` 금지 (forbidigo)
   - ✅ `errors.New(errors.TypeX, errors.CodeX, "...")`, `errors.Wrapf(...)` 패턴
2. **로깅**: `log/slog` 사용. `go.uber.org/zap` 금지 (depguard `nozap`).
   - sloglint 규칙: **attr-only**(키-값 attr 사용), **static-msg**(메시지는 정적 문자열),
     **context: all**(컨텍스트 전달), **key-naming: snake_case**.
   - ✅ `slog.InfoContext(ctx, "user_created", slog.String("user_id", id))`
3. **출력**: `fmt.Print*`, `print`, `println` 금지 (forbidigo). 로깅으로 대체.

## 권장 패턴
- **에러 체크**: 모든 에러 처리 (errcheck). `_ =` 로 무시하지 말 것.
- **인터페이스**: 동일 시그니처 중복 금지 (iface identical).
- **미사용 제거**: unused, ineffassign, wastedassign, unparam 통과.
- **godot**: 주석은 마침표로 끝낸다.
- **bodyclose**: HTTP response body 는 반드시 close.

## 모듈 작성
- 도메인 모듈은 `pkg/modules/<도메인>/` 에 인터페이스 + 구현 분리.
- 의존성은 `pkg/factory` 로 주입. 전역 상태 지양.
- 설정은 `pkg/config` 패턴으로 구조화.
- DB 접근은 `pkg/sqlstore` 추상화를 통해. 직접 드라이버 호출 지양.

## 에디션 분리
- Community 코드(`pkg/`)는 `ee/` 에 의존하면 안 된다.
- Enterprise 변형은 `ee/` 에 같은 모듈명으로 둔다.

## 테스트
- `make go-test` 로 단위 테스트 실행.
- mockery 로 목 생성 (`.mockery.yml`, `make gen-mocks`).
- 테이블 드리븐 테스트 권장.

## 완료 전 검증 (필수)
```
make go-test
golangci-lint run   # 또는 해당 패키지 대상
make go-build-community   # 빌드 통과 확인
```
린트·빌드·테스트가 실제로 통과하기 전에는 "완료"라고 보고하지 않는다. (하네스 원칙: `CLAUDE.md`)