pipeline {
    agent any

    tools {
        jdk    'JDK 17'
        maven  'Maven 3.9'
        nodejs 'Node 22'
    }

    stages {

        // ─────────────────────────────────────────────
        stage('Checkout') {
        // ─────────────────────────────────────────────
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────────
        stage('Backend — Tests + Coverage') {
        // ─────────────────────────────────────────────
            steps {
                dir('backend') {
                    sh 'mvn test -B -Dspring.profiles.active=test'
                }
            }
            post {
                always {
                    // Publish JUnit test results
                    junit 'backend/target/surefire-reports/*.xml'
                    // Publish JaCoCo coverage report
                    jacoco(
                        execPattern:   'backend/target/jacoco.exec',
                        classPattern:  'backend/target/classes',
                        sourcePattern: 'backend/src/main/java'
                    )
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Backend — Build JAR') {
        // ─────────────────────────────────────────────
            steps {
                dir('backend') {
                    sh 'mvn package -B -DskipTests'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Frontend — Install') {
        // ─────────────────────────────────────────────
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Frontend — Tests') {
        // ─────────────────────────────────────────────
            steps {
                dir('frontend') {
                    sh 'npm test -- --watch=false'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Frontend — Build') {
        // ─────────────────────────────────────────────
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Docker — Build Images') {
        // ─────────────────────────────────────────────
            steps {
                sh 'docker-compose build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}
