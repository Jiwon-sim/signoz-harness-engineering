#!/bin/bash
# 신규 기능 dev 환경 띄우기: 백엔드(8081) 컨테이너 기동 + 프론트 dev 서버(3301).
# 기존 signoz(8080, release)와 나란히 비교용. 사용법: bash scripts/dev-up.sh  (Ctrl+C 로 종료)
set -e
export PATH="$HOME/.local/go/bin:$HOME/.local/node/bin:$PATH"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1] 기존 signoz(8080) 확인"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/health | grep -q 200; then
  echo "    OK: http://localhost:8080 (기존, 신규기능 없음)"
else
  echo "    꺼져있음 → 기동: (cd $REPO/deploy/docker && docker compose up -d)  또는  bash $REPO/deploy/install.sh"
fi

echo "[2] 신규 백엔드(signoz-mybuild :8081) 기동"
if docker ps -a --format '{{.Names}}' | grep -qx signoz-mybuild; then
  docker start signoz-mybuild >/dev/null
  echo "    OK: http://localhost:8081  (우리 바이너리)"
else
  echo "    컨테이너 없음 → 먼저:  bash $REPO/scripts/dev-rebuild-backend.sh"
  exit 1
fi

echo "[3] 프론트 dev 서버(3301) 시작 — Ctrl+C 로 종료"
cd "$REPO/frontend"
export VITE_FRONTEND_API_ENDPOINT=http://localhost:8081
export BROWSER=none
echo "    브라우저:  http://localhost:3301  (첫 접속 시 회원가입 → /settings/system-health)"
exec pnpm dev
