pipeline {
  agent {
    kubernetes {
      defaultContainer 'jnlp'
      yaml '''
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-deployer
  restartPolicy: Never

  hostAliases:
  - ip: "192.168.20.102"
    hostnames:
    - harbor.nextonm.com

  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest

  - name: kaniko
    image: gcr.io/kaniko-project/executor:v1.23.2-debug
    command:
    - /busybox/cat
    tty: true
    env:
    - name: DOCKER_CONFIG
      value: /kaniko/.docker
    resources:
      requests:
        cpu: "1"
        memory: "2Gi"
      limits:
        cpu: "2"
        memory: "4Gi"

    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker

  volumes:
  - name: docker-config
    secret:
      secretName: harbor-docker-config
      items:
      - key: .dockerconfigjson
        path: config.json
'''
    }
  }

  environment {
    REGISTRY = "harbor.nextonm.com:30080"
    PROJECT  = "signoz"
    IMAGE    = "custom-signoz"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 90, unit: 'MINUTES')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm

        script {
          env.TAG = sh(
            script: 'git rev-parse --short=8 HEAD',
            returnStdout: true
          ).trim()

          env.FULL_IMAGE =
            "${env.REGISTRY}/${env.PROJECT}/${env.IMAGE}:${env.TAG}"

          echo "IMAGE = ${env.FULL_IMAGE}"
        }
      }
    }

    stage('Build & Push') {
      steps {
        container('kaniko') {
          sh '''
            /kaniko/executor \
              --context "${WORKSPACE}" \
              --dockerfile "${WORKSPACE}/Dockerfile" \
              --destination "${FULL_IMAGE}" \
              --build-arg VERSION="${TAG}" \
              --insecure \
              --skip-tls-verify \
              --snapshot-mode=redo \
              --use-new-run=true
              --cache=false
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Push 성공: ${env.FULL_IMAGE}"
    }

    failure {
      echo "빌드 실패. 콘솔 로그 확인."
    }
  }
}