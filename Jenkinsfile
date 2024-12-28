pipeline {
    agent any
 
    environment {
        DOCKER_USERNAME = 'parash0007'
        DOCKER_ACCESS_TOKEN = 'dckr_pat_2yGRuHttLQT3oDLfgtIUIssBVH8'
        FRONTEND_IMAGE = 'parash0007/caterorange'
        BACKEND_IMAGE = 'parash0007/caterorange'
        IMAGE_TAG = sh(script: 'date +%d-%m-%Y', returnStdout: true).trim()
        DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1321862528942215189/T9Z26bAFPsiD1xe26xXzQfxzXXVywzWPp-7csfAWvNcSg7WXy4QRZ5bMmGgp7_HEPOJc'
    }

    stages {
        stage('Clone Repository') {
            steps {
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
            }
        }
        
        stage('Get Commit Details') {
            steps {
                script {
                    def commitId = sh(script: 'cd CaterOrange && git log -1 --format=%H', returnStdout: true).trim()
                    def author = sh(script: 'cd CaterOrange && git log -1 --format=%an', returnStdout: true).trim()
                    def commitMessage = sh(script: 'cd CaterOrange && git log -1 --format=%s', returnStdout: true).trim()
                    def commitTime = sh(script: 'cd CaterOrange && git log -1 --format=%cr', returnStdout: true).trim()

                    echo "Commit ID: ${commitId}"
                    echo "Author: ${author}"
                    echo "Commit Message: ${commitMessage}"
                    echo "Commit Time: ${commitTime}"

                    def message = """{
                        "content": "Deployment Report",
                        "embeds": [
                            {
                                "title": "Build Status",
                                "fields": [
                                    { "name": "Result", "value": "Success", "inline": true },
                                    { "name": "Commit", "value": "${commitId}", "inline": true },
                                    { "name": "Author", "value": "${author}", "inline": true },
                                    { "name": "Message", "value": "${commitMessage}", "inline": false },
                                    { "name": "Relative Time", "value": "${commitTime}", "inline": false },
                                    { "name": "Report", "value": "The build completed successfully and the images were pushed to Docker Hub.", "inline": false }
                                ]
                            }
                        ]
                    }"""

                    echo "Sending message to Discord..."
                    sh """
                        curl -X POST -H "Content-Type: application/json" -d '${message}' ${DISCORD_WEBHOOK_URL}
                    """
                }
            }
        }

        stage('Docker Login') {
            steps {
                script {
                    sh """
                        echo $DOCKER_ACCESS_TOKEN | docker login -u $DOCKER_USERNAME --password-stdin
                    """
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    sh '''
                        cd CaterOrange/Backend
                        ls -la
                        echo "Building Backend Docker Image..."
                        docker build -t backend-temp-image .
                        
                        docker tag backend-temp-image $BACKEND_IMAGE:Backend-${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    sh '''
                        cd CaterOrange/Frontend
                        echo "Building Frontend Docker Image..."
                        docker build -t frontend-temp-image .
                        
                        docker tag frontend-temp-image $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Push Backend Docker Image') {
            steps {
                script {
                    sh '''
                        echo "Pushing Backend Docker Image to Docker Hub..."
                        docker push $BACKEND_IMAGE:Backend-${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                script {
                    sh '''
                        echo "Pushing Frontend Docker Image to Docker Hub..."
                        docker push $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Stop Existing Containers') {
            steps {
                script {
                    sh '''
                        echo "Stopping existing containers..."
                        docker stop frontend-container || true
                        docker stop backend-container || true
                        docker rm frontend-container || true
                        docker rm backend-container || true
                    '''
                }
            }
        }

        stage('Pull Docker Images') {
            steps {
                script {
                    sh '''
                        echo "Pulling latest Docker images..."
                        docker pull $BACKEND_IMAGE:Backend-${IMAGE_TAG}
                        docker pull $FRONTEND_IMAGE:Frontend-${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {
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
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
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
                // Send failure details to Discord
                sendDiscordNotification("failure")
            }
        }
        success {
            script {
                echo 'Pipeline completed successfully!'
                // Send success details to Discord
                sendDiscordNotification("success")
            }
        }
    }
}

// Send commit details to Discord
def sendDiscordNotification(buildStatus) {
    // Fetch commit details
    dir('CaterOrange') {
        def commitID = sh(script: 'git log -1 --format=%H', returnStdout: true).trim()
        def author = sh(script: 'git log -1 --format=%an', returnStdout: true).trim()
        def commitMessage = sh(script: 'git log -1 --format=%s', returnStdout: true).trim()
        def relativeTime = sh(script: 'git log -1 --format=%ar', returnStdout: true).trim()

        // Construct the payload
        def payload = """{
            "username": "Jenkins",
            "embeds": [
                {
                    "color": ${buildStatus == "success" ? 3066993 : 15158332},
                    "title": "Build Result: ${buildStatus}",
                    "fields": [
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
                            "value": "${buildStatus == "success" ? "Build completed successfully." : "Build failed. Please check the logs."}"
                        }
                    ]
                }
            ]
        }"""

        // Send the payload to Discord
        sh "curl -X POST --data-urlencode 'payload_json=${payload}' ${DISCORD_WEBHOOK_URL}"
    }
}
