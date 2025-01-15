// This Jenkinsfile is for Eureka Deployment 

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
        // Add Maven specific environment variables
        MAVEN_OPTS = '-Dmaven.repo.local=.m2/repository -XX:+TieredCompilation -XX:TieredStopAtLevel=1'
    }
    options {
        // Add build options
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    stages {
        stage ('Initialize') {
            steps {
                script {
                    // Clean workspace but preserve Maven cache
                    sh '''
                        if [ ! -d .m2/repository ]; then
                            mkdir -p .m2/repository
                        fi
                    '''
                }
            }
        }
        stage ('Build') {
            steps {
                echo "Building the ${env.APPLICATION_NAME} Application"
                sh '''
                    echo "Maven build starting..."
                    mvn -B -U clean package \
                        -DskipTests=true \
                        -Dmaven.test.failure.ignore=true \
                        -T 1C \
                        --fail-at-end
                    echo "Maven build completed"
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
                }
            }
        }
        stage ('Sonar') {
            steps {
                echo "Starting Sonar Scans"
                withSonarQubeEnv('SonarQube'){ // The name u saved in system under manage jenkins
                    sh """
                    mvn  sonar:sonar \
                        -Dsonar.projectKey=i27-eureka \
                        -Dsonar.host.url=${env.SONAR_URL} \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
                timeout (time: 2, unit: 'MINUTES'){
                    waitForQualityGate abortPipeline: true
                }

            }
        }
        stage ('Run Tests') {
            steps {
                sh '''
                    echo "Running unit tests..."
                    mvn test
                '''
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        stage ('Docker Build and Push') {
            steps { 
                // Existing artifact format: i27-eureka-0.0.1-SNAPSHOT.jar
                // My Destination artifact format: i27-eureka-buildnumber-branchname.jar
                echo "My JAR Source: i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING}"
                echo "My JAR Destination: i27-${env.APPLICATION_NAME}-${BUILD_NUMBER}-${BRANCH_NAME}.${env.POM_PACKAGING}"
                sh """
                  echo "************************* Building Docker image*************************"
                  pwd
                  ls -la
                  cp ${WORKSPACE}/target/i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING} ./.cicd
                  ls -la ./.cicd
                  docker build --no-cache --build-arg JAR_SOURCE=i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING} -t ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT} ./.cicd
                  # docker.io/i27devopsb4/eureka:
                  #docker build -t imagename:tag dockerfilepath
                  echo "************************ Login to Docker Registry ************************"
                  docker login -u ${DOCKER_CREDS_USR} -p ${DOCKER_CREDS_PSW}
                  docker push ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
                """

            } 
        }
        stage ('Deploy to feature') {
            steps {
                echo "Deploying to feature Server"
                withCredentials([usernamePassword(credentialsId: 'venky_ssh_docker_server_creds', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    script {
                        sh "sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip \"docker pull ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}\""
                        try {
                            // Stop the Container
                            sh "sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip docker stop ${env.APPLICATION_NAME}-feature"
                            // Remove the Container
                            sh "sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip docker rm ${env.APPLICATION_NAME}-feature"
                        }
                        catch(err) {
                            echo "Error Caught: $err"
                        }
                        // Create the container
                        sh "sshpass -p '$PASSWORD' -v ssh -o StrictHostKeyChecking=no $USERNAME@$dev_ip docker run -dit --name ${env.APPLICATION_NAME}-feature -p 1234:8761 ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}"
                    }   
                }
                // create a container 
                // docker container create imagename 
                // docker run -dit --name containerName imageName 
                // docker run -dit --name eureka-dev
                // docker run -dit --name eureka-test
                // docker run -dit --name eureka-stage
                // docker run -dit --name eureka-prod
                // docker run -dit --name ${env.APPLICATION_NAME}-dev -p 1234:8761 ${env.DOCKER_HUB}/${env.APPLICATION_NAME}:${GIT_COMMIT}
            }
        }
    }
    post {
        always {
            // Cleanup workspace but preserve Maven cache
            cleanWs(patterns: [[pattern: '.m2/repository/**', type: 'EXCLUDE']])
        }
        success {
            echo "Build successful! Artifact: i27-${env.APPLICATION_NAME}-${env.POM_VERSION}.${env.POM_PACKAGING}"
        }
        failure {
            echo 'Build failed! Check logs for details.'
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