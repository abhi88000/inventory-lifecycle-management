# Inventory Lifecycle Management

This project is a production-oriented garment and inventory tracking system for lot lifecycle management. It is built around a tenant-aware backend, Postgres persistence, and a React frontend that exposes lot and roll data by tenant.

## Architecture

- Backend: Java 17, Spring Boot 3.1.x, Spring Data JPA, Flyway
- Database: PostgreSQL
- Frontend: React + TypeScript + Vite
- Security and tenant model: request-scoped tenant context using the X-Tenant-ID header and database-level tenant isolation patterns
- Deployment model: monolith service behind a reverse proxy or application server

## Core flow

Fabric rolls and production lots move through the workflow:

- RECEIVED
- CUTTING
- STITCHING
- WASHING
- FINISHING
- PACKING
- COMPLETED
- DISPATCHED

The app exposes lot and roll data for the active tenant and records stage progression in lot history.

## Repository structure

- Backend: src/main/java/com/futurezminds/inventory
- Config: src/main/resources/application.properties
- Database migrations: src/main/resources/db/migration
- Frontend: frontend/
- Tenant enforcement: src/main/java/com/futurezminds/inventory/tenant

## Database and migrations

The app uses PostgreSQL as the source of truth. Flyway runs on startup and applies migrations from the db/migration folder.

The migration set includes:

- V1__init.sql: core schema for production_stages, lots, lot_stage_history, rolls
- V2__seed_sample_data.sql: initial seed data for the demo tenant
- V3__enable_rls.sql: row-level security policy setup for tenant isolation

## Tenant model

Every API request is expected to include the X-Tenant-ID header. The tenant filter sets the active tenant for the request and the app filters lots and rolls by tenant.

The production design is tenant-aware at the application layer and is compatible with Postgres row-level security policies.

## Local development

### Start Postgres

```bash
docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### Run the backend

```bash
mvn clean package
mvn spring-boot:run
```

The default datasource configuration points at PostgreSQL and uses environment overrides:

- DB_URL
- DB_USERNAME
- DB_PASSWORD

### Run the frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## Important endpoints

- GET /api/lots — list lots for the active tenant
- POST /api/lots — create a lot
- POST /api/lots/{id}/move — stage movement and history entry
- GET /api/lots/{id}/history — lot history
- GET /api/rolls — list rolls for the active tenant

## Seed data

The project seeds sample data for the demo tenant into Postgres during migration. This provides immediate lot and roll records for dashboard and API validation without relying on an in-memory database.

## Production assumptions

- Postgres is the default runtime database.
- Flyway is enabled and controls schema setup and seed data.
- Tenant routing is enforced by the app and supported by Postgres RLS patterns.
- The app is designed as a single deployable service, not a demo-only H2 project.

## Current status

The final codebase is configured for Postgres-backed production behavior and sample data loading in the migration layer, rather than demo-only H2 behavior.

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
