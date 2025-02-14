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

       
                stage('Build Backend Docker Image') {
                    steps {
                        script {
                            try {
                                sh '''
                                    cd CaterOrange-frontend-backend/Backend
                                    echo "Building Backend Docker Image..."
                                    docker build -t backendcaterorange:${IMAGE_TAG} .
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
                    
                    # Check if package.json exists and is valid
                    if [ ! -f package.json ]; then
                        echo "Error: package.json not found!"
                        exit 1
                    fi
                    
                    # Print Node and npm versions for debugging
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    
                    # Clean up any previous build artifacts
                    rm -rf build node_modules
                    docker system prune -f
                    
                    echo "Building Frontend Docker Image..."
                    # Build with verbose output and save logs
                    DOCKER_BUILDKIT=1 docker build \
                        --progress=plain \
                        --no-cache \
                        -t frontendcaterorange:${IMAGE_TAG} . 2>&1 | tee frontend_build.log
                    
                    # Verify the image was created
                    if ! docker images | grep -q frontendcaterorange:${IMAGE_TAG}; then
                        echo "Error: Image not created successfully!"
                        exit 1
                    fi
                '''
                echo "Frontend Docker image built successfully."
            } catch (Exception e) {
                // Print build logs if they exist
                sh '''
                    if [ -f frontend_build.log ]; then
                        echo "Build logs:"
                        cat frontend_build.log
                    fi
                    
                    # Print container logs if the container exists
                    if docker ps -a | grep -q frontend-container; then
                        echo "Container logs:"
                        docker logs frontend-container
                    fi
                '''
                sendDiscordNotification("failure", [stageName: "Build Docker Frontend Images", reason: e.getMessage()])
                error("Frontend Docker image build failed: ${e.getMessage()}")
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
                        sendDiscordNotification("failure", [stageName: "Remove Existing Images...", reason: e.getMessage()])
                        error("Stage 'Stop Existing Containers' failed: ${e.getMessage()}")
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
                                backendcaterorange:${IMAGE_TAG}
            
                            echo "Starting Frontend container..."
                            docker run -it \
                                --name frontend-container \
                                --network host \
                                -d -p 3000:3000\
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
