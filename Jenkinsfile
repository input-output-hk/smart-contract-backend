pipeline {
  agent any

  tools {nodejs "Node 10"}

  // Lock concurrent builds due to the docker dependency
  options {
    lock resource: 'DockerJob'
    disableConcurrentBuilds()
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm i'
      }
    }
    stage('Unit/Integration Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('E2E Setup') {
      steps {
        sh 'docker-compose build --no-cache'
        sh 'docker-compose up -d'
      }
    }
    stage('E2E Test') {
      steps {
        sh 'npm run e2e:local'
      }
    }
  }
  post {
    always {
      sh 'docker kill $(docker ps -q) || true'
      sh 'docker-compose down'
      sh 'docker system prune -a -f'
    }
  }
}
