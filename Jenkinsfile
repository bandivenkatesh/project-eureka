// This Jenkinsfile is for Eureka Deployment with SonarQube Integration

pipeline {
    agent {
        label 'k8s-slave'
    }
    tools {
        maven 'Maven-3.8.8'
        jdk 'JDK-17'
    }
    environment {
        APPLICATION_NAME = "eureka"
        SONAR_TOKEN = credentials('sonar_creds')  // SonarQube token stored in Jenkins credentials
        SONAR_URL = "http://34.68.98.190:9000"
        DOCKER_HUB = "docker.io/venky2222"
        DOCKER_CREDS = credentials('dockerhub_creds') // DockerHub credentials
    }
    stages {
        stage('Build') {
            steps {
                echo "Building the ${env.APPLICATION_NAME} Application"
                sh 'mvn clean package -DskipTests=true'
            }
        }
        stage('Sonar Scan') {
            steps {
                echo "Starting Sonar Scans"
                sh """
                mvn sonar:sonar \
                    -Dsonar.projectKey=${env.APPLICATION_NAME} \
                    -Dsonar.host.url=${env.SONAR_URL} \
                    -Dsonar.login=${env.SONAR_TOKEN}
                """
            }
        }
    }
}
