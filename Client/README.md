# Learnora Client

Next.js App Router, React, TypeScript, Tailwind CSS, Redux Toolkit, and React Query.

## Run

From `Client/`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Copy the environment template only when `.env.local` does not already exist. The client runs at [localhost:3000](http://localhost:3000) and connects to the NestJS API at `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). Restart the development server after changing this variable.

## Check and build

```powershell
npm run lint
npm run build
npm start
```

## Application

- Public: `/`, `/courses`, `/courses/[slug]`, `/pricing`.
- Accounts: `/login`, `/register`.
- Learning: `/learn`, course lessons, quizzes, cohorts, paths, certificates, and streaks.
- Teaching: `/studio`, course builder, cohorts, community, analytics, and AI tools.
- Organization: `/admin` and `/settings`.

Content containers use 90% of the available page or workspace area. Public pages use the academic design system in `src/app/globals.css`.

For the complete local stack, database setup, and demo accounts, see the [project guide](../Server/docs/PROJECT.md). On Windows, `npm run dev:all` from `Server/` launches the client, API, and AI service together.
