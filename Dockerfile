# SigNoz(community) 멀티스테이지 빌드 — 프론트+백엔드 컴파일까지 
# 빌드 컨텍스트 = repo 루트.  예:  docker build -t signoz-community:dev .
# 구조는 기존 cmd/community/Dockerfile 과 동일(바이너리 /root/signoz, 프론트 /etc/signoz/web/).

ARG OS="linux"
ARG TARGETARCH="amd64"
ARG VERSION="dev"

# 1) 프론트엔드 빌드 
FROM node:22-bookworm AS frontend
WORKDIR /app/frontend
# pnpm 10.x 고정: engines(>=10 <11) 충족 + lockfileVersion 9.0 호환. node:22 이미지에 npm 포함.
RUN npm install -g pnpm@10
# 소스 통째 복사 후 install/build.
#   ※ 캐시 분리(package.json만 먼저) 불가: postinstall(i18-generate-hash.cjs, scripts/update-registry.cjs)이
#     소스 파일을 참조하고, .npmrc(engine-strict)·pnpm-workspace.yaml 도 install 시점에 있어야 함.
COPY frontend/ ./
RUN CI=1 pnpm install --frozen-lockfile && pnpm build && test -d build

# ── 2) 백엔드 빌드 (Go, community 바이너리) ──
FROM golang:1.25-bookworm AS backend
ARG OS
ARG TARGETARCH
ARG VERSION
ENV GOFLAGS="-buildvcs=false"
WORKDIR /src
# 의존성 레이어 캐시: go.mod/go.sum 먼저
COPY go.mod go.sum ./
RUN go mod download
# 전체 소스 복사 후 community 빌드 (정적 바이너리)
COPY . .
RUN CGO_ENABLED=0 GOOS=${OS} GOARCH=${TARGETARCH} \
    go build -C cmd/community -tags timetzdata \
    -o /out/signoz-community \
    -ldflags "-s -w \
      -X github.com/SigNoz/signoz/pkg/version.variant=community \
      -X github.com/SigNoz/signoz/pkg/version.version=${VERSION} \
      -X github.com/SigNoz/signoz/pkg/version.hash=${VERSION}"

# ── 3) 최종 패키징 (기존 cmd/community/Dockerfile 구조 그대로) ──
FROM alpine:3.20.3
LABEL maintainer="signoz"
WORKDIR /root
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
COPY --from=backend  /out/signoz-community  /root/signoz
COPY                 ./templates            /root/templates
COPY --from=frontend /app/frontend/build/   /etc/signoz/web/
RUN chmod 755 /root /root/signoz
ENTRYPOINT ["./signoz", "server"]