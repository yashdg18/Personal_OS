# My Personal OS

My Personal OS is a private, responsive MERN workspace for goals, daily execution, planning, career growth, exams, skills, focus, books, notes, memories, documents, and encrypted private messages.

## What is complete

- JWT authentication with HttpOnly cookies, protected routes, password changes, and reset-token architecture
- Responsive application shell with mobile navigation, grouped sidebar, loading states, empty states, and error states
- Dashboard with daily progress, active/overdue goals, deadlines, streaks, weekly rhythm, and module summaries
- Screenshot-inspired monthly progress grid with passed/current/future states and custom-goal tracking
- Inline Today checklist with fast add, complete, remove, date switching, priority, and category
- Private meditation audio library with local upload, playback, and removal controls
- CRUD modules for goals, daily tasks, monthly/weekly/daily plans, career goals/projects/applications, exams, current skills, future skills, books, notes, gallery metadata, and private document metadata
- Focus mode with Pomodoro/custom timer, distraction counter, completed sessions, and focus history
- Analytics dashboard with task, goal, skill, book, and focus summaries plus charts
- Profile editor and workspace/password settings
- Separate vault password, short-lived unlock token, server-side authorization, and AES-GCM encrypted secret content
- Owner-scoped MongoDB records, validation boundaries, Helmet, CORS allow-list, auth rate limiting, and centralized errors

Gallery and document records intentionally store private metadata and storage keys. The production storage adapter should issue signed Cloudinary/S3 URLs; binary content is never stored in MongoDB.

Meditation audio is intentionally stored in the current browser for privacy and instant playback. A production sync adapter can be connected later without changing the UI.

## Stack

- Client: React, Vite, React Router, Axios, Tailwind CSS, Recharts, Lucide React
- Server: Node.js, Express, Mongoose, JWT, bcryptjs, express-validator, Helmet, CORS, express-rate-limit
- Database: MongoDB

## Local setup

1. Install Node.js 20+ and MongoDB.
2. Copy `.env.example` to `server/.env` and set a long random `JWT_SECRET`.
3. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

4. Start the API and client:

```bash
npm run dev
```

The client runs on `http://localhost:5173`; the API runs on `http://localhost:5000`.

For a production preview after `npm run build --prefix client`:

```bash
npm run preview --prefix client
```

## Verification

```bash
npm run build
```

The completed source package is generated under `outputs/` without `node_modules`, MongoDB runtime files, or secrets.

See [docs/architecture.md](docs/architecture.md) for the architecture and [docs/api.md](docs/api.md) for the REST contract.
