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
        POM_VERSION = readMavenPom().getVersion()
        POM_PACKAGING = readMavenPom().getPackaging()
        DOCKER_HUB = "docker.io/venky2222"
        DOCKER_CREDS = credentials('dockerhub_creds')
        dev_ip = "10.2.0.4"
        MAVEN_OPTS = '-Dmaven.repo.local=.m2/repository -Xmx1024m'
        APP_PORT = '8761'
        HEALTH_CHECK_ENDPOINT = ':8761/actuator/health'
    }
    stages {
        stage('Build') {
            steps {
                withEnv(["MAVEN_OPTS=-Dmaven.repo.local=${WORKSPACE}/.m2/repository"]) {
                    sh '''
                        mkdir -p ${WORKSPACE}/.m2/repository
                        mvn -B clean install -DskipTests=true -V
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
                                -Dsonar.login=${SONAR_TOKEN} \
                                -Dsonar.java.binaries=target/classes \
                                -Dsonar.sources=src/main/java \
                                -Dsonar.java.libraries=${WORKSPACE}/.m2/repository/**/*.jar
                            '''
                        }
                    }
                    timeout(time: 2, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage ('Docker Build and Push') {
            steps { 
                script {
                    dockerBuildAndPush().call()
                }
            } 
        }
        stage ('Deploy to Dev') {
            steps {
                script {
                    //envDeploy, hostPort, contPort)
                    dockerDeploy('dev1', '1234', '8761').call()
                }
            }
        }
        stage ('Deploy to Test') {
            steps {
                script {
                    //envDeploy, hostPort, contPort)
                    dockerDeploy('tst1', '1235', '8761').call()
                }
            }
        }
        stage ('Deploy to Stage') {
            steps {
                script {
                    //envDeploy, hostPort, contPort)
                    dockerDeploy('stg1', '1236', '8761').call()
                }

            }
        }
        stage ('Deploy to Prod') {
            steps {
                script {
                    //envDeploy, hostPort, contPort)
                    dockerDeploy('prd1', '1237', '8761').call()
                }
            }
        }
    }
}


// Method for Maven Build
def buildApp() {
    return {
        echo "Building the ${env.APPLICATION_NAME} Application"
        sh 'mvn clean package -DskipTests=true'
    }
}

// Method for Docker build and Push
def dockerBuildAndPush(){
    return {
        echo "************************* Building Docker image*************************"
        sh """
            pwd
            ls -la
            cp ${WORKSPACE}/target/i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING} ./.cicd
            ls -la ./.cicd
            docker build --no-cache --build-arg JAR_SOURCE=i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING} -t ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT} ./.cicd
            echo "************************ Login to Docker Registry ************************"
            docker login -u ${DOCKER_CREDS_USR} -p ${DOCKER_CREDS_PSW}
            docker push ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
        """
    }
}


// Method for deploying containers in diff env
def dockerDeploy(envDeploy, hostPort, contPort){
    return {
        echo "Deploying to $envDeploy Environment"
        withCredentials([usernamePassword(credentialsId: 'venky_ssh_docker_server_creds', 
                                        passwordVariable: 'PASSWORD', 
                                        usernameVariable: 'USERNAME')]) {
            script {
                // Pull the image
                sh "sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip \"docker pull ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}\""
                
                try {
                    // Stop and remove existing container
                    sh """
                        sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip \"
                        docker stop ${env.APPLICATION_NAME}-$envDeploy || true
                        docker rm ${env.APPLICATION_NAME}-$envDeploy || true
                        \"
                    """
                } catch(err) {
                    echo "Container cleanup error: $err"
                }

                // Create new container with proper networking
                sh """
                    sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip \"
                    docker run -d --name ${env.APPLICATION_NAME}-$envDeploy \
                    -p $hostPort:$contPort \
                    --network host \
                    -e SPRING_PROFILES_ACTIVE=$envDeploy \
                    -e SERVER_PORT=$contPort \
                    -e EUREKA_INSTANCE_HOSTNAME=localhost \
                    -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://localhost:$hostPort/eureka/ \
                    --restart unless-stopped \
                    --memory=512m \
                    --cpu-shares=512 \
                    ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
                    \"
                """

                // Health check
                retry(5) {
                    sleep 20
                    sh """
                        sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip \"
                        curl -f http://localhost:$hostPort/actuator/health || exit 1
                        \"
                    """
                }
            }   
        }
    }
}




// Eureka 
// continer port" 8761

// dev hp: 5761
// tst hp: 6761
// stg hp: 7761
// prod hp: 8761














//withCredentials([usernameColonPassword(credentialsId: 'mylogin', variable: 'USERPASS')])

// https://docs.sonarsource.com/sonarqube/9.9/analyzing-source-code/scanners/jenkins-extension-sonarqube/#jenkins-pipeline

// sshpass -p password ssh -o StrictHostKeyChecking=no username@dockerserverip
 

 //usernameVariable : String
// Name of an environment variable to be set to the username during the build.
// passwordVariable : String
// Name of an environment variable to be set to the password during the build.
// credentialsId : String
// Credentials of an appropriate type to be set to the variable.