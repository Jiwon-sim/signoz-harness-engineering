# Local Kubernetes Deployment — 로컬 K8s 배포 가이드

> 향후 목표의 **설계 골격**. 아직 구현 전 초안이다. 상태: Draft
> 관련: [ci-cd-roadmap.md](./ci-cd-roadmap.md)

## 목표
SigNoz 를 로컬 Kubernetes(kind / minikube / Docker Desktop K8s)에 배포해,
Jenkins 파이프라인의 최종 Deploy 스테이지를 검증한다.

## 배포 대상 구성 요소
| 구성 요소 | 역할 | 상태 종류 |
|-----------|------|-----------|
| ClickHouse | 관측 데이터 저장 | Stateful (PVC 필요) |
| 메타스토어 (Postgres) | 메타데이터 | Stateful (PVC 필요) |
| signoz-otel-collector | 텔레메트리 수집 | Stateless |
| Query Service (백엔드) | API/쿼리 | Stateless |
| Frontend | 웹 UI | Stateless |

## 현재 자산 (실측)
- `deploy/docker`, `deploy/docker-swarm` 에 컨테이너 구성 존재.
- 이미지: `make docker-buildx-community|enterprise`.
- → K8s 매니페스트는 **신규 작성 필요** (`deploy/k8s/` 제안).

## 제안 디렉토리 구조 (신규)
```
deploy/k8s/
├── base/                       # 공통 매니페스트 (Kustomize base)
│   ├── clickhouse.yaml         # StatefulSet + PVC + Service
│   ├── postgres.yaml           # StatefulSet + PVC + Service
│   ├── otel-collector.yaml     # Deployment + Service + ConfigMap
│   ├── query-service.yaml      # Deployment + Service
│   ├── frontend.yaml           # Deployment + Service
│   └── kustomization.yaml
└── overlays/
    └── local/                  # 로컬용 패치 (이미지 태그, 리소스 축소)
        └── kustomization.yaml
```

## 단계별 로드맵
| 단계 | 내용 |
|------|------|
| 1 | 로컬 클러스터 준비 (kind/minikube) + 로컬 레지스트리 |
| 2 | Stateful: ClickHouse·Postgres 매니페스트 + PVC, 기동 확인 |
| 3 | otel-collector ConfigMap + Deployment, ClickHouse 연결 확인 |
| 4 | Query Service Deployment, 메타스토어/ClickHouse 연결 |
| 5 | Frontend Deployment + Ingress(또는 port-forward) |
| 6 | Kustomize overlay 로 로컬 리소스 튜닝, end-to-end 확인 |

## 검증 (배포 후)
```bash
kubectl get pods -n signoz              # 모든 파드 Running
kubectl port-forward svc/frontend 3301  # UI 접속 확인
# OTLP 로 샘플 텔레메트리 전송 → UI 에서 데이터 확인
```

## 결정 필요 (구현 전 합의)
- [ ] 로컬 클러스터: kind vs minikube vs Docker Desktop.
- [ ] 스토리지: 기본 StorageClass vs 명시적 PVC 크기.
- [ ] 매니페스트 방식: 순수 YAML + Kustomize vs Helm 차트.
- [ ] Community / Enterprise 이미지 선택.

## 다음
합의 후 → `/create-spec k8s-local-deploy` 로 상세 스펙 작성 → 매니페스트 구현 → Jenkins Deploy 연동.
