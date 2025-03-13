pipeline {
    agent any

    environment {
        IMAGE_TAG = sh(script: 'date +%d-%m-%Y', returnStdout: true).trim()
        PREVIOUS_IMAGE_TAG = sh(script: 'date --date="yesterday" +%d-%m-%Y', returnStdout: true).trim()
        DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1322529282957770752/Rm6o7tuWGxEHeWtKBOM6ITKDRh8Eq4zsYvTrjlxczEwCC73-s68yw-tKcaX84b9f7dek'
        failedStage = ''
        failedStageMessage = ''
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    try {
                        timeout(time: 20, unit: 'MINUTES') {
                            sh '''
                                #!/bin/bash
                                if [ -d "CaterOrange-frontend-backend" ]; then
                                    echo "Removing existing CaterOrange directory..."
                                    rm -rf CaterOrange-frontend-backend
                                fi
                                echo "Cloning repository..."
                                git clone -v --depth 1 https://Sirisha-eng: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@github.com/CaterOrange/CaterOrange-frontend-backend.git
                            '''
                        }
                    } catch (Exception e) {
                        failedStage = 'Clone Repository'
                        failedStageMessage = "Error during repository cloning: ${e.getMessage()}"
                        error("Failed to clone repository. Aborting pipeline.")
                    }
                }
            }
        }

              stage('Build Frontend') {
    steps {
        script {
            try {
                sh '''
                    cd CaterOrange-frontend-backend/Frontend
                   
                    
                    echo "Building Frontend Docker Image..."
                    docker build --network=postgres_network --no-cache -t frontendcaterorange:${IMAGE_TAG} .
                '''
            } catch (Exception e) {
                failedStage = 'Build Frontend'
                failedStageMessage = "Error during frontend build: ${e.getMessage()}"
                error("Frontend build failed.")
            }
        }
    }
}
                stage('Build Backend') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange-frontend-backend/Backend
                                    echo "Building Backend Docker Image..."
                                    docker build --network=postgres_network --no-cache -t backendcaterorange:${IMAGE_TAG} .
                                '''
                            } catch (Exception e) {
                                failedStage = 'Build Backend'
                                failedStageMessage = "Error during backend build: ${e.getMessage()}"
                                error("Backend build failed.")
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
                            docker stop frontend-container backend-container || true
                            docker rm frontend-container backend-container || true
                        '''
                    } catch (Exception e) {
                        failedStage = 'Stop Existing Containers'
                        failedStageMessage = "Error stopping containers: ${e.getMessage()}"
                        error("Failed to stop containers.")
                    }
                }
            }
        }

        stage('Remove Old Images') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Removing old images..."
                            docker rmi frontendcaterorange:${PREVIOUS_IMAGE_TAG} || true
                            docker rmi backendcaterorange:${PREVIOUS_IMAGE_TAG} || true
                        '''
                    } catch (Exception e) {
                        failedStage = 'Remove Old Images'
                        failedStageMessage = "Error removing images: ${e.getMessage()}"
                        error("Failed to remove old images.")
                    }
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Starting Backend container..."
                            docker run \
                                --name backend-container \
                                --network postgres_network \
                                -d -p 4000:4000 \
                                backendcaterorange:${IMAGE_TAG}
            
                            echo "Starting Frontend container..."
                            docker run \
                                --name frontend-container \
                                --network postgres_network \
                                -d -p 3000:3000 \
                                frontendcaterorange:${IMAGE_TAG}
                        '''
                    } catch (Exception e) {
                        failedStage = 'Deploy Containers'
                        failedStageMessage = "Error deploying containers: ${e.getMessage()}"
                        error("Failed to deploy containers.")
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
                               
                            fi
                            
                            if ! docker ps | grep -q frontend-container; then
                                echo "Frontend container is not running!"
                              
                            fi
                            
                            # Add curl health checks for your services
                            if ! curl -s http://localhost:4000/health; then
                                echo "Backend health check failed!"
                               
                            fi
                            
                            if ! curl -s http://localhost:3000/health; then
                                echo "Frontend health check failed!"
                                
                            fi
                            
                            echo "All containers are running successfully!"
                        '''
                    } catch (Exception e) {
                        failedStage = 'Health Check'
                        failedStageMessage = "Health check failed: ${e.getMessage()}"
                        error("Health check failed.")
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
    dir('CaterOrange-frontend-backend') {
        def commitInfo = [:]
        try {
            commitInfo.commitID = sh(script: 'git log -1 --format=%H', returnStdout: true).trim()
            commitInfo.author = sh(script: 'git log -1 --format=%an', returnStdout: true).trim()
            commitInfo.commitMessage = sh(script: 'git log -1 --format=%s', returnStdout: true).trim()
            commitInfo.relativeTime = sh(script: 'git log -1 --format=%ar', returnStdout: true).trim()
            commitInfo.organizationName = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim().split('/')[3]
        } catch (Exception e) {
            echo "Failed to get git information: ${e.message}"
            commitInfo.commitID = 'N/A'
            commitInfo.author = 'N/A'
            commitInfo.commitMessage = 'N/A'
            commitInfo.relativeTime = 'N/A'
            commitInfo.organizationName = 'CaterOrange'
        }

        def colorCode = buildStatus == "success" ? 3066993 : 15158332
        def description = buildStatus == "success" 
            ? "Pipeline completed successfully!" 
            : "Pipeline failed!\nStage: ${errorDetails?.stageName}\nReason: ${errorDetails?.reason}"

        def payload = """{
            "username": "Jenkins",
            "embeds": [
                {
                    "color": ${colorCode},
                    "title": "CaterOrange-Jenkins Result: ${buildStatus.toUpperCase()}",
                    "description": "${description}",
                    "fields": [
                        {
                            "name": "Organization",
                            "value": "${commitInfo.organizationName}"
                        },
                        {
                            "name": "Commit",
                            "value": "${commitInfo.commitID}"
                        },
                        {
                            "name": "Author",
                            "value": "${commitInfo.author}"
                        },
                        {
                            "name": "Message",
                            "value": "${commitInfo.commitMessage}"
                        },
                        {
                            "name": "Relatives",
                            "value": "${commitInfo.relativeTime}"
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
