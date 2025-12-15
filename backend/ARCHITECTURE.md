# Backend microservices et API exposées

Ce document résume les microservices configurés actuellement, les routes du gateway et les principaux endpoints REST disponibles dans chaque service. Il décrit aussi rapidement la logique métier implémentée pour que le frontend sache quoi appeler.

## API Gateway (port 8080)
- URL racine pour le frontend : `http://localhost:8080/api/*`.
- CORS autorisé pour `http://localhost:4200` avec les méthodes GET/POST/PUT/DELETE/OPTIONS.
- Routage :
  - `/api/auth/**` → `auth-service` (port 8081)
  - `/api/events/**` → `event-service` (port 8082)
  - `/api/notifications/**` → `notification-service` (port 8083)
  - `/api/registrations/**` → `registration-service` (port 8084)

## Event Service (`/api/events`)
- `GET /api/events?keyword=&category=&location=` : recherche multi-critères.
- `GET /api/events/{id}` : détail d'un événement.
- `GET /api/events/organizer/{organizerId}` : liste des événements créés par l'organisateur (vérifie l'en-tête `X-User-Id` pour éviter la consultation par un autre utilisateur, sauf rôle `ADMIN`).
- `GET /api/events/organizer/{organizerId}/stats` : statistiques agrégées (total, à venir, passés, capacité totale, fréquentation moyenne).
- `POST /api/events` : création (l'ID organisateur peut être forcé via l'en-tête `X-User-Id`).
- `PUT /api/events/{id}` : mise à jour d'un événement.
- `DELETE /api/events/{id}` : suppression.

## Registration Service (`/api/registrations`)
- `POST /api/registrations/events/{eventId}` : inscrire un utilisateur (ID déterminé via `userId` dans le body ou l'en-tête `X-User-Id`).
- `DELETE /api/registrations/{registrationId}` : annuler l'inscription (statut mis à `CANCELLED`).
- `PUT /api/registrations/{registrationId}/status` : modifier le statut (`PENDING`, `CONFIRMED`, `CANCELLED`).
- `GET /api/registrations/status?eventId=&userId=` : vérifier si un utilisateur est inscrit et récupérer son statut/ID d'inscription.
- `GET /api/registrations/user/{userId}` : récupère les inscriptions d'un utilisateur.
- `GET /api/registrations/event/{eventId}` : liste des inscriptions d'un événement (prévu pour contrôle organisateur/admin via en-têtes `X-User-Id`/`X-User-Role`).
- `GET /api/registrations/event/{eventId}/export` : export CSV des inscrits avec nom/email/téléphone/date/statut.
- `GET /api/registrations/stats/{eventId}` : statistiques de participation (confirmés, en attente, annulés, places restantes).

## Modèle d'inscription
- Enregistre les coordonnées du participant (`participantName`, `participantEmail`, `participantPhone`), des notes libres, la date d'inscription, le statut, et les identifiants `eventId`/`userId`.
- Le statut par défaut est `CONFIRMED` et la date d'inscription est initialisée automatiquement.

## Comment utiliser depuis le frontend Angular
1. Configurer `environment.ts` pour pointer sur `http://localhost:8080/api`.
2. Utiliser des services Angular pour appeler les endpoints ci-dessus (ex. `EventService`, `RegistrationService`).
3. Propager l'identité de l'utilisateur via les en-têtes `X-User-Id` et `X-User-Role` quand une vérification d'accès est nécessaire (consultation d'événements organisateur, export d'inscriptions, etc.).

Ce résumé répond à la demande "explique ce que tu as fait" en documentant les routes et logiques actuellement codées.
