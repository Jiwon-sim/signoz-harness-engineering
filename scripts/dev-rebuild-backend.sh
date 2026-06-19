#!/bin/bash
# 백엔드 코드 변경 시(또는 컨테이너가 없을 때): 바이너리 재빌드 + signoz-mybuild 컨테이너 갱신.
# 사용법: bash scripts/dev-rebuild-backend.sh
set -e
export PATH="$HOME/.local/go/bin:$PATH"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

echo "[1] 커뮤니티 바이너리 빌드 (캐시되어 빠름)"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -C cmd/community -tags timetzdata \
  -o /tmp/signoz-community \
  -ldflags "-s -w -X github.com/SigNoz/signoz/pkg/version.version=mybuild -X github.com/SigNoz/signoz/pkg/version.variant=community"
echo "    OK: /tmp/signoz-community"

echo "[2] 컨테이너 갱신"
if docker ps -a --format '{{.Names}}' | grep -qx signoz-mybuild; then
  docker cp /tmp/signoz-community signoz-mybuild:/root/signoz
  docker restart signoz-mybuild >/dev/null
  echo "    기존 컨테이너 바이너리 교체 + 재시작"
else
  docker create --name signoz-mybuild --network signoz-net -p 8081:8080 \
    -e SIGNOZ_ALERTMANAGER_PROVIDER=signoz \
    -e SIGNOZ_TELEMETRYSTORE_CLICKHOUSE_DSN=tcp://clickhouse:9000 \
    -e SIGNOZ_SQLSTORE_SQLITE_PATH=/var/lib/signoz/signoz.db \
    -e SIGNOZ_TOKENIZER_JWT_SECRET=secret \
    -v signoz-mybuild-sqlite:/var/lib/signoz \
    signoz/signoz:v0.128.0
  docker cp /tmp/signoz-community signoz-mybuild:/root/signoz
  docker start signoz-mybuild >/dev/null
  echo "    컨테이너 새로 생성 + 기동"
fi
echo "[done] 백엔드 :8081 준비됨.  이후  bash scripts/dev-up.sh  로 프론트까지."
