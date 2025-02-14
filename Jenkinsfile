pipeline {
    agent any

    environment {
        IMAGE_TAG = sh(script: 'date +%d-%m-%Y', returnStdout: true).trim()
        Previous_IMAGE_TAG = sh(script: 'date --date="yesterday" +%d-%m-%Y', returnStdout: true).trim()
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
                                if [ -d "CaterOrange-frontend-backend" ]; then
                                    echo "Removing existing CaterOrange directory..."
                                    rm -rf CaterOrange-frontend-backend
                                fi
                                echo "Cloning repository..."
                                git clone -v --depth 1 https://ParashDeveloper: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@github.com/CaterOrange/CaterOrange-frontend-backend.git
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

        stage('Verify Frontend Dependencies') {
            steps {
                script {
                    try {
                        sh '''
                            cd CaterOrange-frontend-backend/Frontend
                            echo "Checking package.json existence and permissions..."
                            ls -la package.json
                            echo "Checking node_modules..."
                            ls -la node_modules || echo "node_modules not found (expected)"
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Verify Frontend Dependencies", reason: e.getMessage()])
                        error("Frontend dependency verification failed: ${e.getMessage()}")
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    try {
                        sh '''
                            cd CaterOrange-frontend-backend/Backend
                            echo "Building Backend Docker Image..."
                            docker build --no-cache -t backendcaterorange:${IMAGE_TAG} .
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
                            cd CaterOrange-frontend-backend/Frontend
                            echo "Building Frontend Docker Image..."
                            docker build --progress=plain --no-cache -t frontendcaterorange:${IMAGE_TAG} . 2>&1 | tee frontend_build.log
                        '''
                        echo "Frontend Docker image built successfully."
                    } catch (Exception e) {
                        sh 'cat frontend_build.log || true'
                        sendDiscordNotification("failure", [stageName: "Build Docker Frontend Images", reason: e.getMessage()])
                        echo "Error during frontend Docker image build: ${e.getMessage()}"
                        error("Frontend Docker image build failed. Aborting pipeline.")
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

        stage('Remove Existing Images') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Remove Existing Images..."
                            docker rmi backendcaterorange:${Previous_IMAGE_TAG} || true
                            docker rmi frontendcaterorange:${Previous_IMAGE_TAG} || true
                        '''
                    } catch (Exception e) {
                        sendDiscordNotification("failure", [stageName: "Remove Existing Images", reason: e.getMessage()])
                        error("Stage 'Remove Existing Images' failed: ${e.getMessage()}")
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
                                -d -p 4000:4000 \
                                backendcaterorange:${IMAGE_TAG}
            
                            echo "Starting Frontend container..."
                            docker run -it \
                                --name frontend-container \
                                --network host \
                                -d -p 3000:3000 \
                                frontendcaterorange:${IMAGE_TAG}
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
                            # Wait for containers to fully start
                            sleep 45
                            
                            # Check if containers are running
                            if ! docker ps | grep -q backend-container; then
                                echo "Backend container is not running!"
                                docker logs backend-container
                                exit 1
                            fi
                            
                            if ! docker ps | grep -q frontend-container; then
                                echo "Frontend container is not running!"
                                docker logs frontend-container
                                exit 1
                            fi
                            
                            # Check if services are responding
                            echo "Checking Backend health..."
                            curl -f http://localhost:4000/health || exit 1
                            
                            echo "Checking Frontend health..."
                            curl -f http://localhost:3000 || exit 1
                            
                            echo "All containers are running and healthy!"
                        '''
                    } catch (Exception e) {
                        sh '''
                            echo "Health check failed. Collecting logs..."
                            docker logs frontend-container || true
                            docker logs backend-container || true
                        '''
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
                sh 'docker logout || true'
                cleanWs() // Clean workspace after build
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
    dir('CaterOrange-frontend-backend') {
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
                    "color": ${colorCode},
                    "title": "CaterOrange-Jenkins Result: ${buildStatus.toUpperCase()}",
                    "description": "${description}",
                    "fields": [
                        {
                            "name": "Organization",
                            "value": "${organizationName}"
                        },
                        {
                            "name": "Commit",
                            "value": "${commitID}"
                        },
                        {
                            "name": "Author",
                            "value": "${author}"
                        },
                        {
                            "name": "Message",
                            "value": "${commitMessage}"
                        },
                        {
                            "name": "Relatives",
                            "value": "${relativeTime}"
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
