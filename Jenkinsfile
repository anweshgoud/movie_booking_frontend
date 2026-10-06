pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                        -t anweshanthati/movie_booking_frontend:${GIT_COMMIT} .
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | \
                            docker login -u "$DOCKER_USERNAME" --password-stdin

                        docker push \
                            anweshanthati/movie_booking_frontend:${GIT_COMMIT}

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'movie-booking-vm-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        echo "Getting currently deployed image tag..."

                        OLD_TAG=$(ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER@34.14.157.155" \
                            "grep '^FRONTEND_IMAGE_TAG=' /home/anwesh_anthati/.env | cut -d= -f2")

                        echo "Previous image tag: $OLD_TAG"
                        echo "New image tag: $GIT_COMMIT"

                        echo "Updating image tag..."

                        ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER@34.14.157.155" \
                            "sed -i 's/^FRONTEND_IMAGE_TAG=.*/FRONTEND_IMAGE_TAG=${GIT_COMMIT}/' /home/anwesh_anthati/.env"

                        echo "Pulling new Docker image..."

                        ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER@34.14.157.155" \
                            "cd /home/anwesh_anthati && docker compose pull react"

                        echo "Starting new backend container..."

                        ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER@34.14.157.155" \
                            "cd /home/anwesh_anthati && docker compose up -d react"

                        echo "Running health check..."

                        HEALTH_CHECK_PASSED=false

                        for i in 1 2 3 4 5
                        do
                            echo "Health check attempt $i/5"

                            if ssh -o StrictHostKeyChecking=no \
                                -i "$SSH_KEY" \
                                "$SSH_USER@34.14.157.155" \
                                "curl --fail http://localhost:8080/actuator/health"; then

                                HEALTH_CHECK_PASSED=true
                                echo "Health check passed!"
                                break
                            fi

                            echo "Health check failed. Waiting 5 seconds..."
                            sleep 5
                        done

                        if [ "$HEALTH_CHECK_PASSED" = true ]; then

                            echo "Deployment successful!"

                        else

                            echo "Health check failed after 5 attempts!"
                            echo "Rolling back to $OLD_TAG"

                            ssh -o StrictHostKeyChecking=no \
                                -i "$SSH_KEY" \
                                "$SSH_USER@34.14.157.155" \
                                "sed -i 's/^FRONTEND_IMAGE_TAG=.*/FRONTEND_IMAGE_TAG=$OLD_TAG/' /home/anwesh_anthati/.env"

                            echo "Pulling previous image..."

                            ssh -o StrictHostKeyChecking=no \
                                -i "$SSH_KEY" \
                                "$SSH_USER@34.14.157.155" \
                                "cd /home/anwesh_anthati && docker compose pull react"

                            echo "Starting previous version..."

                            ssh -o StrictHostKeyChecking=no \
                                -i "$SSH_KEY" \
                                "$SSH_USER@34.14.157.155" \
                                "cd /home/anwesh_anthati && docker compose up -d react"

                            echo "Rollback completed."

                            exit 1
                        fi
                    '''
                }
            }
        }
    }
}
