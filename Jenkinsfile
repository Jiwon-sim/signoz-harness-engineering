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
  serviceAccountName: jenkins-deployer

  hostAliases:
    - ip: "192.168.20.102"
      hostnames:
        - harbor.nextonm.com

  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:v1.23.2-debug
      command:
        - /busybox/cat
      tty: true
      resources:
        requests:
          cpu: "200m"
          memory: "512Mi"
        limits:
          cpu: "1"
          memory: "2Gi"

    - name: deployer
      image: alpine/k8s:1.30.5
      command:
        - cat
      tty: true
      resources:
        requests:
          cpu: "100m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "512Mi"
'''
    }
  }

  parameters {
    string(name: 'HARBOR_REGISTRY', defaultValue: 'harbor.nextonm.com:30080', description: 'Harbor 주소(host:port)')
    string(name: 'HARBOR_PROJECT', defaultValue: 'signoz', description: 'Harbor 프로젝트')
    string(name: 'IMAGE_NAME', defaultValue: 'signoz-community', description: '이미지명')
    string(name: 'DEPLOY_NAMESPACE', defaultValue: 'signoz', description: '배포 네임스페이스')
    string(name: 'HELM_RELEASE', defaultValue: 'signoz', description: 'Helm 릴리스명')
    booleanParam(name: 'REGISTRY_INSECURE', defaultValue: true, description: 'HTTP/self-signed Harbor')
    booleanParam(name: 'DEPLOY', defaultValue: false, description: '배포 수행 여부')
  }

  environment {
    IMAGE_REPO = "${params.HARBOR_REGISTRY}/${params.HARBOR_PROJECT}/${params.IMAGE_NAME}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG = sh(
            returnStdout: true,
            script: 'git rev-parse --short=8 HEAD'
          ).trim()

          env.FULL_IMAGE = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"

          echo "빌드 대상 이미지: ${env.FULL_IMAGE}"
        }
      }
    }

    stage('Image Build & Push (Kaniko)') {
      steps {
        container('kaniko') {
          withCredentials([
            usernamePassword(
              credentialsId: 'harbor-robot',
              usernameVariable: 'HARBOR_USER',
             