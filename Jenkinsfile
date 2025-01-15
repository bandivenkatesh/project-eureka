// This Jenkinsfile is for Eureka Deployment 

pipeline {
    agent {
        label 'k8s-slave'
    }
    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    tools {
        maven 'Maven-3.8.8'
        jdk 'JDK-17'
    }
    environment {
        APPLICATION_NAME = "eureka" 
        SONAR_TOKEN = credentials('sonar_creds')
        SONAR_URL = "http://34.68.98.190:9000"
        // https://www.jenkins.io/doc/pipeline/steps/pipeline-utility-steps/#readmavenpom-read-a-maven-project-file
        // If any errors with readMavenPom, make sure pipeline-utility-steps plugin is installed in your jenkins, if not do install it
        // http://34.139.130.208:8080/scriptApproval/
        POM_VERSION = readMavenPom().getVersion()
        POM_PACKAGING = readMavenPom().getPackaging()
        DOCKER_HUB = "docker.io/venky2222"
        DOCKER_CREDS = credentials('dockerhub_creds') //username and password
        dev_ip = "10.2.0.4"
        MAVEN_OPTS = '-Dmaven.repo.local=.m2/repository -Xmx1024m'
        APP_PORT = '8761'
        HEALTH_CHECK_ENDPOINT = ':8761/actuator/health'
    }
    stages {
        stage('Build and Analysis') {
            parallel {
                stage('Build') {
                    steps {
                        // Using MAVEN_OPTS for local repository
                        withEnv(["MAVEN_OPTS=-Dmaven.repo.local=${WORKSPACE}/.m2/repository"]) {
                            sh '''
                                # Create local Maven repo directory
                                mkdir -p ${WORKSPACE}/.m2/repository
                                # Run Maven build with local repo
                                mvn -B clean package -DskipTests=true -V
                            '''
                        }
                    }
                }
                stage('Sonar Analysis') {
                    steps {
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            withSonarQubeEnv('SonarQube') {
                                withEnv(["MAVEN_OPTS=-Dmaven.repo.local=${WORKSPACE}/.m2/repository"]) {
                                    sh '''
                                        mvn sonar:sonar \
                                        -Dsonar.projectKey=i27-eureka \
                                        -Dsonar.host.url=${SONAR_URL} \
                                        -Dsonar.login=${SONAR_TOKEN}
                                    '''
                                }
                            }
                            timeout(time: 2, unit: 'MINUTES') {
                                waitForQualityGate abortPipeline: true
                            }
                        }
                    }
                }
            }
        }
        stage('Docker Build and Push') {
            steps {
                script {
                    def dockerImage
                    retry(2) {
                        docker.withRegistry('https://docker.io', 'dockerhub_creds') {
                            dockerImage = docker.build("${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}", 
                                "--no-cache --build-arg JAR_SOURCE=i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING} ./.cicd")
                            dockerImage.push()
                        }
                    }
                }
            }
        }
        stage('Deploy to feature') {
            steps {
                script {
                    def remote = [:]
                    remote.name = 'feature'
                    remote.host = dev_ip
                    withCredentials([usernamePassword(credentialsId: 'venky_ssh_docker_server_creds', 
                                                    passwordVariable: 'PASSWORD', 
                                                    usernameVariable: 'USERNAME')]) {
                        remote.user = USERNAME
                        remote.password = PASSWORD
                        remote.allowAnyHosts = true
                        
                        sshCommand remote: remote, command: """
                            docker pull ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
                            docker stop ${env.APPLICATION_NAME}-feature || true
                            docker rm ${env.APPLICATION_NAME}-feature || true
                            docker run -d --name ${env.APPLICATION_NAME}-feature \
                                -p 1234:${APP_PORT} \
                                --restart unless-stopped \
                                --memory=512m \
                                --cpu-shares=512 \
                                ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
                        """
                        
                        // Health check
                        retry(5) {
                            sleep 10
                            sh "curl -f http://${dev_ip}${HEALTH_CHECK_ENDPOINT} || exit 1"
                        }
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs(patterns: [
                [pattern: '.m2/repository/**', type: 'INCLUDE']
            ])
            sh 'docker system prune -f'
        }
        success {
            echo 'Pipeline succeeded! Application is deployed and healthy.'
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
        }
    }
}