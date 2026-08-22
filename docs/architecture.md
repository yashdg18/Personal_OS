# Architecture

## Runtime boundaries

```text
React/Vite client
  -> Axios service layer with credentials
  -> Express REST API
      -> auth, vault authorization, validation, and error middleware
      -> controllers
      -> Mongoose models
  -> MongoDB

Private binary storage adapter (Cloudinary/S3-compatible)
  <- authenticated API metadata + signed URL layer
```

The browser receives the main JWT through an HttpOnly cookie. The separate vault token is short-lived and sent only in the `x-vault-token` header after the server verifies the vault password. No sensitive password or access token is placed in ordinary local storage.

## Client structure

- `client/src/App.jsx` — protected route composition
- `client/src/components/layout/` — responsive shell, sidebar, and topbar
- `client/src/pages/app/ModulePage.jsx` — reusable CRUD list/form/card system for the workspace modules
- `client/src/pages/app/` — dashboard, focus timer, analytics, vault, profile, settings, Today checklist, monthly/custom progress tracker, meditation audio, pending, and planner experiences
- `client/src/services/api.js` — Axios base URL and error normalization
- `client/src/context/AuthContext.jsx` — session restoration and identity state

The module pages share one visual system but keep module-specific fields/configuration in one place. This makes new resources additive rather than copy-pasted.

## Server structure

- `server/src/app.js` — middleware and route composition
- `server/src/models/User.js` — identity, profile, password reset, and vault hash
- `server/src/models/WorkspaceItem.js` — owner-scoped records for the CRUD modules
- `server/src/controllers/` — resource aggregation and mutation logic
- `server/src/middleware/auth.js` — main session authorization
- `server/src/middleware/vaultAuth.js` — second-factor vault-session authorization
- `server/src/utils/secure.js` — AES-GCM secret encryption/decryption

The shared `WorkspaceItem` collection intentionally stores module-specific extensions inside a bounded `data` object while indexing owner, type, dates, completion, and creation time. Binary files are represented by metadata/storage keys, never by large MongoDB blobs.

## Completed project phases

1. Authentication, shell, and dashboard
2. Goals and daily tasks
3. Monthly, weekly, and daily planning
4. Career goals, projects, applications, exams
5. Current and future skills
6. Focus mode and distraction tracking
7. Books and notes
8. Gallery metadata and private document metadata
9. Separate encrypted secret vault
10. Protected document metadata and storage-ready URLs
11. Analytics, responsive polish, loading/empty/error states, and verification

## Production hardening before deployment

- Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and a strict `CLIENT_URL`.
- Connect the gallery/document storage adapter to private Cloudinary/S3 buckets and issue short-lived signed URLs only after owner checks.
- Configure an email provider for password reset delivery.
- Put the API behind HTTPS and a reverse proxy with request logging and monitoring.
- Add automated API/component tests and a background worker for reminders when notifications are needed.
