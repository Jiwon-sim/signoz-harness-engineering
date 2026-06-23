pipeline {
  agent {
    kubernetes {
      defaultContainer 'jnlp'
      yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    job: signoz-cicd
spec:
  serviceAccountName: jenkins-deployer        # 배포 권한(in-cluster). RBAC YAML 먼저 apply.
  hostAliases:                                # kaniko 파드가 harbor.nextonm.com 을 찾게
    - ip: "192.168.20.102"                    # ← 워커 노드 IP (아무 워커 하나)
      hostnames: ["harbor.nextonm.com"]
  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.23.2-debug
      command: ["sleep"]
      args: ["infinity"]
      resources:
        requests: { cpu: "1", memory: "2Gi" }   # 멀티스테이지(go+pnpm) 빌드라 넉넉히
        limits:   { cpu: "2", memory: "4Gi" }
    - name: deployer
      image: alpine/k8s:1.30.5                  # helm + kubectl 포함
      command: ["sleep"]
      args: ["infinity"]
      resources:
        requests: { cpu: "250m", memory: "512Mi" }
        limits:   { cpu: "1", memory: "1Gi" }
'''
    }
  }

  triggers { pollSCM('* * * * *') }            

  parameters {
    string(name: 'HARBOR_REGISTRY', defaultValue: 'harbor.nextonm.com:30080', description: 'Harbor 주소(host:port, HTTP)')
    string(name: 'HARBOR_PROJECT',  defaultValue: 'signoz',          description: 'Harbor 프로젝트')
    string(name: 'IMAGE_NAME',      defaultValue: 'signoz-community', description: '이미지명')
    string(name: 'DEPLOY_NAMESPACE',defaultValue: 'signoz',          description: '배포 네임스페이스')
    string(name: 'HELM_RELEASE',    defaultValue: 'signoz',          description: 'Helm 릴리스명')
    booleanParam(name: 'REGISTRY_INSECURE', defaultValue: true,      description: 'HTTP/self-signed Harbor면 true')
    booleanParam(name: 'DEPLOY',    defaultValue: false,             description: '배포 수행 여부(첫 검증은 false 권장)')
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    IMAGE_REPO = "${params.HARBOR_REGISTRY}/${params.HARBOR_PROJECT}/${params.IMAGE_NAME}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG  = sh(returnStdout: true, script: 'git rev-parse --short=8 HEAD 2>/dev/null || echo ${BUILD_NUMBER}').trim()
          env.FULL_IMAGE = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"
          echo "빌드 대상 이미지: ${env.FULL_IMAGE}"
        }
      }
    }

    // 빌드+패키징을 Dockerfile(멀티스테이지)이 전부 수행 → Kaniko 한 스테이지로 끝.
    stage('Image Build & Push (Kaniko)') {
      steps {
        container('kaniko') {
          withCredentials([usernamePassword(credentialsId: 'harbor-robot', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS')]) {
            sh '''
              set -eu
              AUTH=$(printf '%s:%s' "$HARBOR_USER" "$HARBOR_PASS" | base64 | tr -d '\\n')
              mkdir -p /kaniko/.docker
              cat > /kaniko/.docker/config.json <<EOF
{"auths":{"${HARBOR_REGISTRY}":{"auth":"${AUTH}"}}}
EOF
              # Harbor(HTTP/self-signed)로의 push 만 insecure. 베이스 이미지는 docker.io(HTTPS)에서
              # 받으므로 --insecure-pull 은 넣지 않는다(넣으면 docker.io pull 이 HTTP로 강제돼 실패).
              INSECURE_FLAGS=""
              if [ "${REGISTRY_INSECURE}" = "true" ]; then
                INSECURE_FLAGS="--insecure --skip-tls-verify"
              fi

              /kaniko/executor \
                --context=dir://${WORKSPACE} \
                --dockerfile=Dockerfile \
                --build-arg TARGETARCH=amd64 \
                --build-arg VERSION=${IMAGE_TAG} \
                --destination=${FULL_IMAGE} \
                --destination=${IMAGE_REPO}:latest \
                ${INSECURE_FLAGS} \
                --cache=false
            '''
          }
        }
      }
    }

    stage('Deploy to local k8s') {
      when { expression { return params.DEPLOY } }
      steps {
        container('deployer') {
          withCredentials([usernamePassword(credentialsId: 'harbor-robot', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS')]) {
            sh '''
              set -eu
              helm repo add signoz https://charts.signoz.io
              helm repo update

              # 네임스페이스 + private Harbor pull secret (노드가 이미지 받을 때 인증)
              kubectl create namespace ${DEPLOY_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
              kubectl -n ${DEPLOY_NAMESPACE} create secret docker-registry harbor-pull \
                --docker-server=${HARBOR_REGISTRY} \
                --docker-username="$HARBOR_USER" \
                --docker-password="$HARBOR_PASS" \
                --dry-run=client -o yaml | kubectl apply -f -

              # signoz 통합 이미지만 우리 Harbor 이미지로 override
              #   ※ image 키 경로(signoz.image.*)는 차트 버전마다 다름 — 배포 전 1회 확인:
              #     helm show values signoz/signoz | grep -nA3 -iE 'image|repository|tag'
              helm upgrade --install ${HELM_RELEASE} signoz/signoz \
                --namespace ${DEPLOY_NAMESPACE} --create-namespace \
                --set signoz.image.registry=${HARBOR_REGISTRY} \
                --set signoz.image.repository=${HARBOR_PROJECT}/${IMAGE_NAME} \
                --set signoz.image.tag=${IMAGE_TAG} \
                --set global.imagePullSecrets[0].name=harbor-pull \
                --wait --timeout 15m

              kubectl -n ${DEPLOY_NAMESPACE} get pods
            '''
          }
        }
      }
    }
  }

  post {
    success { echo "완료: ${env.FULL_IMAGE}" }
    failure { echo "실패 — 콘솔 로그 확인" }
  }
}