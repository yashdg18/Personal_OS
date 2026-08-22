# REST API map

Base URL: `/api`. All success responses use `{ success: true, data: ... }`. Errors use `{ success: false, error: { message, code, details? } }`.

## Authentication and identity

- `POST /auth/register` — create a user and set an HttpOnly access cookie.
- `POST /auth/login` — authenticate and set an HttpOnly access cookie.
- `POST /auth/logout` — clear the access cookie.
- `GET /auth/me` — return the current authenticated user.
- `PATCH /auth/password` — change the current password.
- `POST /auth/forgot-password` and `POST /auth/reset-password` — reset architecture with generic account-safe responses.
- `GET /users/me` and `PATCH /users/me` — read/update profile and workspace preferences.

## Dashboard, analytics, and focus

- `GET /dashboard/overview?date=YYYY-MM-DD` — today’s tasks, goals, deadlines, streak, rhythm, and module summaries.
- `GET /analytics/overview` — 14-day productivity series and cross-module progress.
- Focus sessions use the authenticated workspace endpoints with `type=focus`; the UI records completed duration and distraction metadata.

## Workspace CRUD

The reusable authenticated resource family is:

```text
GET    /workspace/:type
POST   /workspace/:type
PATCH  /workspace/:type/:id
POST   /workspace/:type/:id/toggle
DELETE /workspace/:type/:id
```

Supported `:type` values:

`goal`, `task`, `plan`, `careerGoal`, `careerProject`, `application`, `exam`, `skill`, `futureSkill`, `book`, `note`, `gallery`, `document`, `focus`.

Every record is scoped to the authenticated `userId`. Search is available through `?q=`, task-day filtering through `?date=YYYY-MM-DD`, and basic status/completion filters through `?status=` and `?completed=`.

## Secret vault

- `POST /vault/setup` — create a separate bcrypt-hashed vault password.
- `POST /vault/unlock` — return a short-lived vault token after password verification.
- `GET /vault`, `POST /vault`, `PATCH /vault/:id`, `DELETE /vault/:id` — encrypted secret CRUD; each request requires `x-vault-token` in addition to normal auth.

The server encrypts secret content with AES-256-GCM before MongoDB persistence. The vault token expires after 30 minutes and is kept only in browser session storage by the client.

## Health

- `GET /health` — process/database health check.
