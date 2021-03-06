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
    stage('E2E Single Process Setup') {
      steps {
        sh 'npm start'
      }
    }
    stage('E2E Single Process Test') {
      steps {
        sh 'npm run e2e:nodejs'
      }
      post {
        always {
          sh 'npm stop || true'
          sh 'git add -A && git reset --hard || true'
        }
      }
    }
    stage('E2E Docker Setup') {
      steps {
        sh 'docker-compose build'
        sh 'docker-compose -p smart-contract-backend up -d'
      }
    }
    stage('E2E Docker Test') {
      steps {
        sh 'npm run e2e:docker'
      }
      post {
        always {
          sh 'docker kill $(docker ps -q) || true'
          sh 'docker-compose -p smart-contract-backend down'
          sh 'docker system prune -a -f'
        }
      }
    }
  }
}
