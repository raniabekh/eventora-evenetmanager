# Projet Web Gues – Frontend

Frontend Angular (CLI 21) qui consomme le Gateway Spring Cloud (`http://localhost:8080/api`). Les services `AuthService`, `EventService`, `RegistrationService` et `OrganizerService` s’appuient tous sur cette base pour dialoguer avec les microservices.

## Configuration API

- Le point d’entrée unique est défini dans `src/environments/environment.ts` :

  ```ts
  export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:8080/api'
  };
  ```

- Les endpoints appelés côté frontend correspondent aux routes du gateway :
  - `POST /api/auth/*` pour l’authentification.
  - `GET/POST/PUT/DELETE /api/events/*` pour la gestion des événements.
  - `GET/POST /api/registrations/*` pour les inscriptions et changements d’état.
  - `GET /api/notifications/*` si besoin des notifications.

Assurez-vous que le gateway et les microservices sont démarrés avant de lancer le frontend.

## Démarrer le frontend

```bash
npm install
ng serve
```

Ensuite ouvrez `http://localhost:4200/`. L’application se recharge automatiquement à chaque modification.

## Build

```bash
ng build
```

Les artefacts seront générés dans `dist/`.

## Tests unitaires

```bash
ng test
```

## Génération de composants (scaffolding)

```bash
ng generate component component-name
```

Consultez `ng generate --help` pour la liste complète des schémas (services, directives, pipes, etc.).
