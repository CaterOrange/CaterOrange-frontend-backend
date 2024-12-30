pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'parash0007'
        DOCKER_ACCESS_TOKEN = 'dckr_pat_2yGRuHttLQT3oDLfgtIUIssBVH8'
        FRONTEND_IMAGE = 'parash0007/caterorange'
        BACKEND_IMAGE = 'parash0007/caterorange'
        IMAGE_TAG = sh(script: 'date +%d-%m-%Y', returnStdout: true).trim()
        DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1322529282957770752/Rm6o7tuWGxEHeWtKBOM6ITKDRh8Eq4zsYvTrjlxczEwCC73-s68yw-tKcaX84b9f7dek'
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    try {
                        timeout(time: 20, unit: 'MINUTES') {
                            sh '''
                                #!/bin/bash
                                if [ -d "CaterOrange" ]; then
                                    echo "Removing existing CaterOrange directory..."
                                    rm -rf CaterOrange
                                fi
                                echo "Cloning repository..."
                                git clone -v --depth 1 https://ParashDeveloper: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@github.com/CaterOrange/CaterOrange.git
                            '''
                        }
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Clone Repository", reason: e.getMessage()])
                        echo "Error during repository cloning: ${e.getMessage()}"
                        error("Failed to clone repository. Aborting pipeline.")
                    }
                }
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    try {
                        sh "echo $DOCKER_ACCESS_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin"
                        echo "Docker login successful."
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Docker Login", reason: e.getMessage()])
                        echo "Error during Docker login: ${e.getMessage()}"
                        error("Docker login failed. Aborting pipeline.")
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Docker Image') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange/Backend
                                    echo "Building Backend Docker Image..."
                                    docker build -t backend-temp-image .
                                    docker tag backend-temp-image $BACKEND_IMAGE:Backend-${IMAGE_TAG}
                                '''
                                echo "Backend Docker image built successfully."
                            } catch (Exception e) {
                                sendDiscordNotification("failure", [stageName: "Build Docker Backend Images", reason: e.getMessage()])
                                echo "Error during backend Docker image build: ${e.getMessage()}"
                                error("Backend Docker image build failed. Aborting pipeline.")
                            }
                        }
                    }
                }
                stage('Build Frontend Docker Image') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange/Frontend
                                    echo "Building Frontend Docker Image..."
                                    docker build -t frontend-temp-image .
                                    docker tag frontend-temp-image $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                                '''
                                echo "Frontend Docker image built successfully."
                            } catch (Exception e) {
                                sendDiscordNotification("failure", [stageName: "Build Docker Frontend Images", reason: e.getMessage()])
                                echo "Error during frontend Docker image build: ${e.getMessage()}"
                                error("Frontend Docker image build failed. Aborting pipeline.")
                            }
                        }
                    }
                }
            }
        }

        stage('Push Docker Images') {
            parallel {
                stage('Push Backend Image') {
                    steps {
                        script {
                            try {
                                echo "Pushing Backend Docker Image to Docker Hub..."
                                sh "docker push $BACKEND_IMAGE:Backend-${IMAGE_TAG}"
                            } catch (Exception e) {
                                sendDiscordNotification("failure", [stageName: "Push Backend Image", reason: e.getMessage()])
                                echo "Error during backend Docker image push: ${e.getMessage()}"
                                error("Backend Docker image push failed. Aborting pipeline.")
                            }
                        }
                    }
                }

                stage('Push Frontend Image') {
                    steps {
                        script {
                            try {
                                echo "Pushing Frontend Docker Image to Docker Hub..."
                                sh "docker push $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}"
                            } catch (Exception e) {
                                sendDiscordNotification("failure", [stageName: "Push Frontend Image", reason: e.getMessage()])
                                echo "Error during frontend Docker image push: ${e.getMessage()}"
                                error("Frontend Docker image push failed. Aborting pipeline.")
                            }
                        }
                    }
                }
            }
        }

        stage('Stop Existing Containers') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Stopping existing containers..."
                            docker stop frontend-container || true
                            docker stop backend-container || true
                            docker rm frontend-container || true
                            docker rm backend-container || true
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Stop Existing Containers", reason: e.getMessage()])
                        error("Stage 'Stop Existing Containers' failed: ${e.getMessage()}")
                    }
                }
            }
        }

        stage('Pull Docker Images') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Pulling latest Docker images..."
                            docker pull $BACKEND_IMAGE:Backend-${IMAGE_TAG}
                            docker pull $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Pull Docker Images", reason: e.getMessage()])
                        error("Stage 'Pull Docker Images' failed: ${e.getMessage()}")
                    }
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Starting Backend container..."
                            docker run -it \
                                --name backend-container \
                                --network host \
                                -d -p 4000:4000\
                                $BACKEND_IMAGE:Backend-${IMAGE_TAG}
            
                            echo "Starting Frontend container..."
                            docker run -it \
                                --name frontend-container \
                                --network host \
                                -d -p 3000:3000\
                                $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Run Containers", reason: e.getMessage()])
                        error("Stage 'Run Containers' failed: ${e.getMessage()}")
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Performing health check..."
                            sleep 30
                            
                            if ! docker ps | grep -q backend-container; then
                                echo "Backend container is not running!"
                                exit 1
                            fi
                            
                            if ! docker ps | grep -q frontend-container; then
                                echo "Frontend container is not running!"
                                exit 1
                            fi
                            
                            echo "All containers are running successfully!"
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Health Check", reason: e.getMessage()])
                        error("Health check failed: ${e.getMessage()}")
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker logout'
            }
        }
        failure {
            script {
                echo 'Pipeline failed! Check the logs for details.'
                sendDiscordNotification("failure")
            }
        }
        success {
            script {
                echo 'Pipeline completed successfully!'
                sendDiscordNotification("success")
            }
        }
    }
}

def sendDiscordNotification(buildStatus, errorDetails = null) {
    // Fetch commit details
    dir('CaterOrange') {
        def commitID = sh(script: 'git log -1 --format=%H', returnStdout: true).trim()
        def author = sh(script: 'git log -1 --format=%an', returnStdout: true).trim()
        def commitMessage = sh(script: 'git log -1 --format=%s', returnStdout: true).trim()
        def relativeTime = sh(script: 'git log -1 --format=%ar', returnStdout: true).trim()
        def organizationName = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim().split('/')[3]
        def description = buildStatus == "success" 
            ? "Pipeline completed successfully!" 
            : "Pipeline failed!\nStage: ${errorDetails?.stageName}\nReason: ${errorDetails?.reason}"

        def colorCode = buildStatus == "success" ? 3066993 : 15158332
        def reportMessage = buildStatus == "success" ? "Build completed successfully." : "Build failed. Please check the description."
        
        // Construct the payload
        def payload = """{
            "username": "Jenkins",
            "embeds": [
                {
                    "color":  ${colorCode},
                    "title": "CaterOrange-Jenkins Result: ${buildStatus.toUpperCase()}",
                    "description": "${description}",
                    "fields": [
                         {
                            "name": "Organization",
                            "value": "${organizationName}"
                        },
                        {
                            "name": "Commit",
                            "value": "$commitID"
                        },
                        {
                            "name": "Author",
                            "value": "$author"
                        },
                        {
                            "name": "Message",
                            "value": "$commitMessage"
                        },
                        {
                            "name": "Relatives",
                            "value": "$relativeTime"
                        },
                        {
                            "name": "Report",
                            "value": "${reportMessage}"
                        }
                    ]
                }
            ]
        }"""
        
        try {
            sh """
                curl -X POST -H "Content-Type: application/json" -d '${payload}' ${DISCORD_WEBHOOK_URL}
            """
            echo "Notification sent to Discord."
        } catch (Exception e) {
            echo "Failed to send Discord notification: ${e.getMessage()}"
        }
    }
}
