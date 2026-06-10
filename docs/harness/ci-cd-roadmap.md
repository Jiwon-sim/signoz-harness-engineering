# CI/CD Roadmap — Jenkins 분리 계획

> 향후 목표의 **설계 골격**. 아직 구현 전이며, 이 문서는 방향·단계를 합의하기 위한 초안이다.
> 상태: Draft (구현 전) · 관련: [k8s-deployment.md](./k8s-deployment.md)

## 목표
현재 빌드/배포는 Makefile + Docker 중심이다. 이를 **Jenkins 파이프라인으로 분리**해
빌드·테스트·이미지 배포를 자동화하고, 최종적으로 로컬 Kubernetes 로 배포한다.

## 현재 상태 (실측)
- 빌드: `make go-build-community|enterprise`, `make js-build`.
- 이미지: `make docker-buildx-community|enterprise` (go-build + js-build 의존).
- 테스트: `make go-test`, `pnpm jest`, `make py-test` (pytest 통합/E2E).
- 배포 산출물: `deploy/docker`, `deploy/docker-swarm`.
- CI 설정: `.github/` (GitHub 기반) — Jenkins 로 별도 분리 예정.

## 목표 파이프라인 (단계)
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Checkout │→ │  Build   │→ │   Test   │→ │  Image   │→ │  Deploy  │
│  (SCM)   │  │ go + js  │  │ go/jest/ │  │ buildx   │  │  k8s     │
│          │  │          │  │ pytest   │  │ + push   │  │ (local)  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
                                              │
                                         레지스트리(로컬)
```

## 단계별 로드맵
| 단계 | 내용 | 산출물 |
|------|------|--------|
| 1 | Jenkins 로컬 기동 (Docker) + 자격 구성 | `Jenkinsfile` 초안 |
| 2 | Build 스테이지: `make go-build-community` + `make js-build` | 빌드 아티팩트 |
| 3 | Test 스테이지: go-test → jest → (옵션) py-test | 테스트 리포트 |
| 4 | Image 스테이지: `make docker-buildx-community` → 로컬 레지스트리 push | 컨테이너 이미지 |
| 5 | Deploy 스테이지: K8s 매니페스트 apply (→ k8s-deployment.md) | 배포된 파드 |

## Jenkinsfile 골격 (예시 — 미검증 초안)
```groovy
pipeline {
  agent any
  stages {
    stage('Build')  { steps { sh 'make go-build-community && make js-build' } }
    stage('Test')   { steps { sh 'make go-test'; dir('frontend') { sh 'pnpm jest' } } }
    stage('Image')  { steps { sh 'make docker-buildx-community' } }
    stage('Deploy') { steps { sh 'kubectl apply -k deploy/k8s/overlays/local' } }
  }
  post { always { /* 테스트 리포트 수집 */ } }
}
```
> ⚠️ 위는 **방향 제시용 골격**이다. 실제 타깃명·경로·자격은 구현 시 Makefile/배포 구조에서 재확인한다.

## 결정 필요 (구현 전 합의)
- [ ] Jenkins 실행 방식: 로컬 Docker vs K8s 내부 배포.
- [ ] 레지스트리: 로컬(registry:2) vs kind/minikube 내장.
- [ ] Community / Enterprise 중 어느 타깃을 우선.
- [ ] pytest 통합 테스트를 파이프라인에 포함할지(인프라 비용).

## 다음
이 로드맵 합의 후 → 별도 spec(`/create-spec ci-cd-jenkins`)으로 상세화 → 구현.
