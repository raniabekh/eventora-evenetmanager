# Eventora – Guide de démarrage rapide

Ce projet combine un backend en microservices Spring Boot (Gradle) derrière un gateway et un frontend Angular. Utilisez ce guide pour lancer l'ensemble en local et vérifier que le frontend dialogue bien avec les APIs.

## Prérequis
- Java 17+ et Gradle Wrapper (`./gradlew`) pour chaque microservice
- Node.js 18+ et Angular CLI (`ng`) pour le frontend

## Démarrer les microservices
Lancer chaque service dans un terminal distinct à partir du dossier indiqué :

1. **Service de découverte (optionnel, port 8761)**
   ```bash
   cd backend/discovery-service/discovery-service
   ./gradlew bootRun
   ```

2. **Auth Service (port 8081)**
   ```bash
   cd backend/auth-service/auth-service
   ./gradlew bootRun
   ```

3. **Event Service (port 8082)**
   ```bash
   cd backend/event-service/Event-Service
   ./gradlew bootRun
   ```

4. **Notification Service (port 8083)**
   ```bash
   cd backend/notif-service/notif-service
   ./gradlew bootRun
   ```

5. **Registration Service (port 8084)**
   ```bash
   cd backend/registration-service/Registration-Service
   ./gradlew bootRun
   ```

6. **API Gateway (port 8080)**
   ```bash
   cd backend/apigateway/apigateway
   ./gradlew bootRun
   ```

Les routes exposées par le gateway sont détaillées dans `backend/ARCHITECTURE.md`. Assurez-vous que chaque service démarre sans erreur avant de passer au frontend.

## Vérifier le routage du gateway
Avec les services lancés, testez par exemple la liste des événements (retournera une liste vide si aucune donnée n'est présente) :
```bash
curl -i http://localhost:8080/api/events
```

## Lancer le frontend Angular
Depuis la racine du frontend :
```bash
cd projet-web-gues-frontend
npm install
ng serve
```

Ouvrez ensuite http://localhost:4200/. Le frontend pointe automatiquement sur `http://localhost:8080/api` via l'environnement Angular (`src/environments/environment.ts`).

## Étapes suivantes
- Créer des utilisateurs via l'Auth Service puis s'authentifier côté frontend.
- Ajouter des événements via le composant organisateur, puis tester l'inscription et la consultation depuis un compte participant.
- Surveiller la console réseau du navigateur pour vérifier les appels `http://localhost:8080/api/*` et ajuster les en-têtes `X-User-Id`/`X-User-Role` si nécessaire.
