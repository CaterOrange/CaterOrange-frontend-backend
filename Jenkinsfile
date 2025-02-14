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
                                if [ -d "CaterOrange-frontend-backend" ]; then
                                    rm -rf CaterOrange-frontend-backend
                                fi
                                git clone --depth 1 https://Sirisha-eng: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@github.com/CaterOrange/CaterOrange-frontend-backend.git
                            '''
                        }
                    } catch (Exception e) {
                        failedStage = 'Clone Repository'
                        failedStageMessage = "Error during repository cloning: ${e.getMessage()}"
                        error("Failed to clone repository.")
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange-frontend-backend/Frontend
                                    docker build -t frontendcaterorange:${IMAGE_TAG} .
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
                                    docker build -t backendcaterorange:${IMAGE_TAG} .
                                '''
                            } catch (Exception e) {
                                failedStage = 'Build Backend'
                                failedStageMessage = "Error during backend build: ${e.getMessage()}"
                                error("Backend build failed.")
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
                            docker run --name backend-container --network host -d -p 4000:4000 backendcaterorange:${IMAGE_TAG}
                            docker run --name frontend-container --network host -d -p 3000:3000 frontendcaterorange:${IMAGE_TAG}
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
                            sleep 30
                            curl -f http://localhost:4000/health || exit 1
                            curl -f http://localhost:3000/health || exit 1
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
            cleanWs()
        }
        failure {
            script {
                def errorDetails = [
                    stageName: failedStage ?: "Unknown Stage",
                    reason: failedStageMessage ?: "Unknown Error"
                ]
                sendDiscordNotification("failure", errorDetails)
            }
        }
        success {
            script {
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
            commitInfo.commitID = 'N/A'
            commitInfo.author = 'N/A'
            commitInfo.commitMessage = 'N/A'
            commitInfo.relativeTime = 'N/A'
            commitInfo.organizationName = 'CaterOrange'
        }

        def colorCode = buildStatus == "success" ? 3066993 : 15158332
        def description = buildStatus == "success" ? "Pipeline executed successfully!" : "Pipeline failed!\nStage: ${errorDetails?.stageName}\nReason: ${errorDetails?.reason}"

        def payload = """{
            "username": "Jenkins",
            "embeds": [
                {
                    "color": ${colorCode},
                    "title": "CaterOrange-Jenkins Result: ${buildStatus.toUpperCase()}",
                    "description": "${description}",
                    "fields": [
                        {"name": "Organization", "value": "${commitInfo.organizationName}"},
                        {"name": "Commit", "value": "${commitInfo.commitID}"},
                        {"name": "Author", "value": "${commitInfo.author}"},
                        {"name": "Message", "value": "${commitInfo.commitMessage}"},
                        {"name": "Relatives", "value": "${commitInfo.relativeTime}"}
                    ]
                }
            ]
        }"""

        sh "curl -X POST -H 'Content-Type: application/json' -d '${payload}' ${DISCORD_WEBHOOK_URL}"
    }
}
