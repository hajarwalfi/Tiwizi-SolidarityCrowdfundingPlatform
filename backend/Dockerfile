# =============================================================================
# TIWIZI Backend - Dockerfile
# =============================================================================
# Multi-stage build pour optimiser la taille de l'image finale
# Stage 1: Build avec Maven → compile le code et génère le JAR
# Stage 2: Runtime avec JRE → exécute l'application (image légère)
# =============================================================================

# -----------------------------------------------------------------------------
# STAGE 1: BUILD
# -----------------------------------------------------------------------------
# On utilise une image Maven avec Java 21 pour compiler le projet
FROM maven:3.9-eclipse-temurin-21 AS build

# Répertoire de travail dans le container
WORKDIR /app

# Copie du fichier pom.xml d'abord (pour profiter du cache Docker)
# Si pom.xml n'a pas changé, Docker réutilise le cache des dépendances
COPY pom.xml .

# Télécharge toutes les dépendances Maven (cette étape est mise en cache)
RUN mvn dependency:go-offline -B

# Copie du code source
COPY src ./src

# Compile et package l'application (génère le fichier JAR)
# -DskipTests : on skip les tests pour accélérer le build
RUN mvn clean package -DskipTests -B

# -----------------------------------------------------------------------------
# STAGE 2: RUNTIME
# -----------------------------------------------------------------------------
# Image légère avec seulement le JRE (pas besoin de Maven en production)
FROM eclipse-temurin:21-jre-alpine

# Répertoire de travail
WORKDIR /app

# Ajouter un utilisateur non-root pour la sécurité
# (bonne pratique: ne jamais exécuter en root)
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copie le JAR depuis le stage de build
# Le fichier JAR se trouve dans target/ après le mvn package
COPY --from=build /app/target/*.jar app.jar

# Définir les permissions
RUN chown -R appuser:appgroup /app

# Utiliser l'utilisateur non-root
USER appuser

# Port exposé par l'application Spring Boot
EXPOSE 8080

# Variables d'environnement par défaut
ENV SPRING_PROFILES_ACTIVE=dev

# Healthcheck pour vérifier que l'application est en bonne santé
# Docker Compose utilise ça pour savoir quand le service est prêt
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Commande pour lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
