# Inventory & Production Tracking (Garment) — MVP

This repository contains a simple web-based production and inventory tracking system for a garment and jeans manufacturing workflow. The project is an MVP and demo-first implementation covering login, dashboard, lot creation, stage movement, lot details and history, search, and persistence with Postgres or H2 for quick demo runs.

## Key business flow

- Fabric roll inventory → CUTTING (create lot from roll; sizes, ratios, and fit) → STITCHING (assign fabricator) → WASHING (assign washer) → FINISHING (assign finisher) → WAREHOUSE STOCK

## Tech stack

- Backend: Java 17, Spring Boot 3.1.x, Spring Data JPA (Hibernate), Flyway migrations
- Database: Postgres (production) — H2 in-memory for quick demo use
- Frontend: React 18 + TypeScript, Vite, Bootstrap 5
- Auth and tenant model: minimal demo security and tenant isolation via the `X-Tenant-ID` header with Postgres row-level security

## Repository layout

- Backend sources: `src/main/java/...` (controllers, services, entities)
- Migrations: `src/main/resources/db/migration/` (Flyway SQL)
- Frontend: `frontend/` (Vite + React app)
- Tenant context: `src/main/java/com/futurezminds/inventory/tenant/TenantContext.java` and `TenantFilter.java`

## Recent feature additions

- `Lot` entity stores cutting details such as `sourceRollNumber`, `rollLength`, `sizeRatiosJson`, `sizeQuantitiesJson`, and `fitType`.
- Backend computes per-size quantities from the provided size ratios when creating a lot using proportional rounding.
- New `Roll` entity and `rolls` table with tenant-scoped `GET /api/rolls` support.
- Frontend create-lot form updated to select a source roll, enter `fitType`, and provide size ratios.

## Important endpoints

- `GET /api/lots` — list lots for the current tenant
- `POST /api/lots` — create a lot
- `POST /api/lots/{id}/move` — move a lot between stages and record history
- `GET /api/lots/{id}/history` — lot stage history
- `GET /api/rolls` — list rolls for the current tenant

## How multi-tenancy works

- The app expects an `X-Tenant-ID` header on API requests. The demo frontend stores the tenant in `localStorage` and sends it automatically.
- For Postgres, a Flyway migration named `V3__enable_rls.sql` enables row-level security policies that use the DB session setting `app.tenant`.
- In demo mode, H2 is used and tenant separation is enforced in the application layer.

## Running locally

### Backend with H2

1. From the repo root, run:

   ```bash
   mvn -DskipTests package
   mvn spring-boot:run
   ```

2. The default `application.properties` uses H2 and disables Flyway in demo mode.

### Frontend

1. From the `frontend/` directory, run:

   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

2. The dev server usually runs on <http://localhost:5173> or <http://localhost:5174>. The frontend reads `VITE_API_BASE` and defaults to <http://localhost:8080/api>.

## Enabling Postgres + Flyway

1. Bring up Postgres with Docker:

   ```bash
   docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
   ```

2. Update `src/main/resources/application.properties` with the Postgres JDBC URL, username, and password, and enable Flyway.
3. Start the backend and verify that `V3__enable_rls.sql` is applied.

> RLS policies work only in Postgres. Confirm that the `TenantFilter` sets the DB session variable `app.tenant` for each request.

## Demo roll creation

- A tenant-scoped `GET /api/rolls` endpoint is available. For testing, you can insert a row directly:

  ```sql
  INSERT INTO rolls (roll_number, fabric, length, tenant_id)
  VALUES ('R-001', 'Denim', '100.0', 'default_tenant');
  ```

## Size ratio behavior

- The create-lot API accepts `sizeRatiosJson`, for example `{ "30": 1, "32": 2, "34": 1, "36": 1 }`.
- The backend computes per-size quantities using proportional allocation: quantity = round(total_pcs * ratio / sum_of_ratios).

## Working assumptions and limitations

- The project is a single deployable monolith.
- Authentication is demo-only.
- RLS SQL exists but requires a Postgres environment for validation.
- Some stage-specific metadata flows are still partial.

## Where things live

- `src/main/java/com/futurezminds/inventory/lot/Lot.java` — lot entity
- `src/main/java/com/futurezminds/inventory/roll/Roll.java` — roll entity
- `src/main/resources/db/migration/` — Flyway migrations
- `frontend/src/App.tsx` — primary frontend UI
- `frontend/src/api.ts` — API client

## Next steps

1. Add a `POST /api/rolls` endpoint and a simple frontend form to create rolls.
2. Improve size-distribution rounding with deterministic remainder handling.
3. Implement stage-specific metadata endpoints for fabricator, washer, and finisher.
4. Re-enable Flyway on Postgres and verify DB-level RLS.
5. Extract microservices and add Docker Compose for a multi-service demo.

## Local run notes

### Backend

- Requirements: Java 17, Maven, PostgreSQL
- Create the database and enable pgcrypto:

  ```sql
  CREATE DATABASE inventory_db;
  \c inventory_db
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  ```

- Build and run:

  ```bash
  mvn -DskipTests package
  mvn spring-boot:run
  ```

- Swagger UI: <http://localhost:8080/swagger-ui/index.html>

### Frontend (Vite + React)

- Requirements: Node 18+ and npm

  ```bash
  cd frontend
  npm install
  npm run dev
  ```

- Frontend dev server: <http://localhost:5173>

The frontend expects the backend at <http://localhost:8080/api>. To change it, set `VITE_API_BASE`.
