# Inventory & Production Tracking (Garment) — MVP

This repository contains a simple web-based production and inventory tracking system for a garment/jeans manufacturing workflow. The project is an MVP and demo-first implementation covering: Login (demo), Dashboard, Add Lot (cutting), Move Lot between stages, Lot details & history, Search, and persistence with Postgres (migrations) or H2 for quick demo runs.

**Key business flow**
- Fabric roll inventory → CUTTING (create Lot from Roll; sizes+ratios+fit) → STITCHING (assign fabricator) → WASHING (assign washer) → FINISHING (assign finisher) → WAREHOUSE STOCK

**Tech stack**
- Backend: Java 17, Spring Boot 3.1.x, Spring Data JPA (Hibernate), Flyway migrations
- Database: Postgres (production) — H2 in-memory available for quick demo
- Frontend: React 18 + TypeScript, Vite, Bootstrap 5 (dev server)
- Auth/tenant: Minimal demo security, tenant isolation via `X-Tenant-ID` header + DB row-level security migrations (Postgres)

Repository layout (important files)
- Backend sources: `src/main/java/...` (controllers, services, entities)
- Migrations: `src/main/resources/db/migration/` (Flyway SQL)
- Frontend: `frontend/` (Vite + React app)
- Tenant context: `src/main/java/com/example/production/tenant/TenantContext.java` and `TenantFilter.java`

Recent feature additions (cutting & roll support)
- `Lot` entity now stores cutting details: `sourceRollNumber`, `rollLength`, `sizeRatiosJson`, `sizeQuantitiesJson`, `fitType`.
- Backend computes per-size quantities from provided size ratios when creating a lot (simple proportional rounding).
- New `Roll` entity and `rolls` table; added tenant-scoped `GET /api/rolls` to list rolls for the current tenant.
- Frontend create-lot form updated: select a source roll, enter `fitType`, and enter size ratios (example inputs for sizes 30/32/34/36).

Important endpoints (demo)
- GET `/api/lots` — list lots (tenant-scoped)
- POST `/api/lots` — create lot (include `sizeRatiosJson`, `sourceRollNumber`, `fitType` in payload)
- POST `/api/lots/{id}/move` — move a lot between stages (records history)
- GET `/api/lots/{id}/history` — lot stage history
- GET `/api/rolls` — list rolls for tenant (used by frontend dropdown)

How multi-tenancy works
- The app expects an `X-Tenant-ID` header on API requests. The demo frontend stores tenant in `localStorage` and sends it automatically.
- For Postgres, a Flyway migration (`V3__enable_rls.sql`) is included to enable RLS policies that use the DB session setting `app.tenant`. The application sets this via `set_config('app.tenant', ...)` in the `TenantFilter`.
- In demo mode (H2) Flyway is disabled and tenant separation is enforced at the application layer (repository/service filters).

Running locally (quick demo with H2)
1. Backend (from repo root):
   mvn -DskipTests package
   mvn spring-boot:run

   Notes: The default `application.properties` in demo mode uses H2 (jdbc:h2:mem:inventory_db;MODE=PostgreSQL) and `spring.flyway.enabled=false` so migrations are not applied on startup in demo mode.

2. Frontend (from `frontend/`):
   cd frontend
   npm install --legacy-peer-deps
   npm run dev

   Dev server runs on a Vite port (usually http://localhost:5173 or http://localhost:5174). The frontend reads `VITE_API_BASE` (defaults to `http://localhost:8080/api`) to point at the backend.

Enabling Postgres + Flyway (for RLS testing)
1. Bring up Postgres (Docker or RDS). Example Docker:
   docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

2. Update `src/main/resources/application.properties` with the Postgres JDBC URL, username, and password, and set `spring.flyway.enabled=true`.
3. Start the backend — Flyway will run migrations including the RLS migration. Verify that `V3__enable_rls.sql` is applied.

Note: RLS policies will only work on Postgres. If you enable RLS, confirm the `TenantFilter` is setting the DB session setting `app.tenant` for each request.

How to create a roll for demo
- At present there's a tenant-scoped GET `/api/rolls`. If you need a roll for testing, insert via SQL into the `rolls` table (or request a UI endpoint from me to add a roll):

  INSERT INTO rolls (roll_number, fabric, length, tenant_id) VALUES ('R-001','Denim','100.0','default_tenant');

Size ratio behavior
- The create-lot API accepts `sizeRatiosJson` (e.g. `{ "30":1, "32":2, "34":1, "36":1 }`). The backend computes per-size quantities by proportional allocation: qty = round(total_pcs * ratio / sum_of_ratios). Remainder distribution is basic rounding — consider improving rounding rules if you need deterministic remainder rules.

Working assumptions & limitations
- The project is currently a single deployable application (monolith). A multi-service split is planned.
- Authentication is minimal/demo-only; production auth + RBAC are not implemented.
- RLS SQL exists but requires a Postgres environment to validate tenant isolation.
- Some stage-specific forms (stitching/washing/finishing) are partially implemented; we store core attributes on `Lot` and keep history in `lot_stage_history`.

Where things live (quick links)
- `src/main/java/com/example/production/lot/Lot.java` — Lot entity (now includes cutting fields)
- `src/main/java/com/example/production/roll/Roll.java` — Roll entity
- `src/main/resources/db/migration/` — Flyway migrations (V1, V3 for RLS)
- `frontend/src/App.tsx` — primary frontend UI and create-lot form
- `frontend/src/api.ts` — API client including `fetchRolls()`

Next steps (priority)
1. Add a `POST /api/rolls` endpoint and a simple frontend form to create rolls (currently `GET /api/rolls` exists). — in progress
2. Improve size-distribution rounding with deterministic remainder handling. — planned
3. Implement stage-specific metadata endpoints for fabricator/washer/finisher and tighten UI. — planned
4. Re-enable Flyway on a Postgres instance and test DB-level RLS (Docker recommended). — planned
5. Extract microservices (lot-service, stage-service, auth-service) and add Docker/compose for local multi-service demo. — planned

If you want, I can:
- add `POST /api/rolls` + frontend UI now, or
- run the backend locally with Postgres (docker) and re-enable Flyway to verify RLS.

Contact / notes
- For tenant-scoped testing use header `X-Tenant-ID: <tenant>`; frontend stores tenant in `localStorage` (input in the header area of the UI).

---
Updated: latest code includes cutting/roll support and size-ratio computation. See the in-repo TODO list for next actions.
# Production & Lot Tracking — Local Run

Backend (Spring Boot)

- Requirements: Java 17, Maven, PostgreSQL
- Create DB and enable pgcrypto extension:

```sql
CREATE DATABASE inventory_db;
\c inventory_db
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

- Build & run backend:

```bash
mvn -DskipTests package
mvn spring-boot:run
```

- Swagger UI: http://localhost:8080/swagger-ui/index.html

Frontend (Vite + React)

- Requirements: Node 18+ and npm

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: http://localhost:5173

The frontend expects the backend at `http://localhost:8080/api`. To change, set `VITE_API_BASE`.
