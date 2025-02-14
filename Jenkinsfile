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
                                git config --global http.postBuffer 524288000
                                
                                if [ -d "admin-2024" ]; then
                                    echo "Directory exists, pulling latest changes..."
                                    cd admin-2024
                                    git reset --hard
                                    git clean -fd
                                    git pull origin main
                                else
                                    echo "Directory does not exist, cloning repository..."
                                    git clone --depth 1 https://ParashDeveloper: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@github.com/CaterOrange/admin-2024.git
                                fi

                                # Clone or update the frontend-backend repository
                                if [ -d "CaterOrange-frontend-backend" ]; then
                                    echo "Frontend-backend directory exists, pulling latest changes..."
                                    cd CaterOrange-frontend-backend
                                    git reset --hard
                                    git clean -fd
                                    git pull origin main
                                else
                                    echo "Frontend-backend directory does not exist, cloning repository..."
                                    git clone -v --depth 1 https://Sirisha-eng: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@github.com/CaterOrange/CaterOrange-frontend-backend.git
                                fi
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

        stage('Build Docker Images') {
            parallel {
                stage('Build Admin Frontend') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd admin-2024/my-app
                                    echo "Building Admin Frontend Docker Image..."
                                    docker build -t admin-caterorange:${IMAGE_TAG} .
                                '''
                            } catch (Exception e) {
                                failedStage = 'Build Admin Frontend'
                                failedStageMessage = "Error during admin frontend build: ${e.getMessage()}"
                                error("Admin frontend build failed.")
                            }
                        }
                    }
                }

                stage('Build Main Frontend') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange-frontend-backend/Frontend
                                    echo "Building Main Frontend Docker Image..."
                                    docker build -t frontendcaterorange:${IMAGE_TAG} .
                                '''
                            } catch (Exception e) {
                                failedStage = 'Build Main Frontend'
                                failedStageMessage = "Error during main frontend build: ${e.getMessage()}"
                                error("Main frontend build failed.")
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
                            echo "Stopping existing containers..."
                            docker stop admin-frontend-container frontend-container backend-container || true
                            docker rm admin-frontend-container frontend-container backend-container || true
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
                            docker rmi admin-caterorange:${PREVIOUS_IMAGE_TAG} || true
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
                                --network host \
                                -d -p 4000:4000 \
                                backendcaterorange:${IMAGE_TAG}
            
                            echo "Starting Main Frontend container..."
                            docker run \
                                --name frontend-container \
                                --network host \
                                -d -p 3000:3000 \
                                frontendcaterorange:${IMAGE_TAG}

                            echo "Starting Admin Frontend container..."
                            docker run \
                                --name admin-frontend-container \
                                --network host \
                                -d -p 3001:3001 \
                                admin-caterorange:${IMAGE_TAG}
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
                            
                            # Check if containers are running
                            if ! docker ps | grep -q backend-container; then
                                echo "Backend container is not running!"
                                exit 1
                            fi
                            
                            if ! docker ps | grep -q frontend-container; then
                                echo "Frontend container is not running!"
                                exit 1
                            fi

                            if ! docker ps | grep -q admin-frontend-container; then
                                echo "Admin Frontend container is not running!"
                                exit 1
                            fi
                            
                            # Health endpoint checks
                            if ! curl -s http://localhost:4000/health; then
                                echo "Backend health check failed!"
                                exit 1
                            fi
                            
                            if ! curl -s http://localhost:3000/health; then
                                echo "Frontend health check failed!"
                                exit 1
                            fi

                            if ! curl -s http://localhost:3001/health; then
                                echo "Admin Frontend health check failed!"
                                exit 1
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
                cleanWs()
            }
        }
        failure {
            script {
                echo 'Pipeline failed! Check the logs for details.'
                def errorDetails = [
                    stageName: failedStage ?: "Unknown Stage",
                    reason: failedStageMessage ?: "Unknown Error"
                ]
                sendDiscordNotification("failure", errorDetails)
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
    def commitInfo = [:]

    // Try to get commit info from both repositories
    ['admin-2024', 'CaterOrange-frontend-backend'].each { repo ->
        if (fileExists(repo)) {
            dir(repo) {
                try {
                    if (!commitInfo.commitID) {
                        commitInfo.commitID = sh(script: 'git log -1 --format=%H', returnStdout: true).trim()
                        commitInfo.author = sh(script: 'git log -1 --format=%an', returnStdout: true).trim()
                        commitInfo.commitMessage = sh(script: 'git log -1 --format=%s', returnStdout: true).trim()
                        commitInfo.relativeTime = sh(script: 'git log -1 --format=%ar', returnStdout: true).trim()
                        commitInfo.organizationName = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim().split('/')[3]
                    }
                } catch (Exception e) {
                    echo "Failed to get git information for ${repo}: ${e.message}"
                }
            }
        }
    }

    // Fallback values if no git info is available
    if (!commitInfo.commitID) {
        commitInfo.commitID = 'N/A'
        commitInfo.author = 'N/A'
        commitInfo.commitMessage = 'N/A'
        commitInfo.relativeTime = 'N/A'
        commitInfo.organizationName = 'CaterOrange'
    }

    def colorCode = buildStatus == "success" ? 3066993 : 15158332
    def description = buildStatus == "success" 
        ? "Pipeline Executed successfully!" 
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
            curl -X POST -H 'Content-Type: application/json' -d '${payload}' ${DISCORD_WEBHOOK_URL}
        """
        echo "Notification sent to Discord."
    } catch (Exception e) {
        echo "Failed to send Discord notification: ${e.getMessage()}"
    }
}
