# Learnora Server

NestJS API with Prisma, PostgreSQL, JWT authentication, course delivery, cohorts, assessments, certificates, analytics, and commerce integration.

## Initial setup

From `Server/`:

```powershell
npm install
Copy-Item .env.example .env
npm run db:up
npx prisma generate
npx prisma migrate deploy
```

Copy the environment template only when `.env` does not already exist. To initialize a fresh demo database, run `npm run prisma:seed`. The full seed resets demo data; to refresh authored content while preserving learner records, use `npm run content:update`.

## Run

```powershell
npm run start:dev
```

API: [localhost:4000](http://localhost:4000/catalog/courses). Swagger: [localhost:4000/docs](http://localhost:4000/docs).

To launch Client, Server, and AI together on Windows after their dependencies and environments are configured:

```powershell
npm run dev:all
```

The launcher can also be invoked from any directory with the full path to `scripts/start-local.ps1`. It keeps logs within each service's `.logs` folder and checks all three endpoints. Open [localhost:3000](http://localhost:3000) after the readiness checks pass.

## Database

Docker Compose lives in this directory. `npm run db:up` starts PostgreSQL, `npm run db:logs` follows its logs, and `npm run db:down` stops the Compose stack. The Compose project name and existing `lms-platform_learnora_pgdata` volume are explicit, so moving the configuration does not switch to a new database volume.

From the repository root, the equivalent command is `docker compose -f Server/docker-compose.yml up -d`.

## Validation

```powershell
npm test
npm run build
```

See the [project guide](docs/PROJECT.md) for architecture, demo accounts, content, and configuration. Client setup is in [Client/README.md](../Client/README.md); AI setup is in [ai/README.md](../ai/README.md).
