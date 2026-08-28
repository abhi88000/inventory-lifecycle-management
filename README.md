# Inventory Lifecycle Management

This project is a production-oriented inventory and garment lifecycle tracking system built for tenant-aware lot and roll operations. The final implementation uses a Spring Boot API backed by PostgreSQL and Flyway, with a Vite React frontend served either locally or behind an NGINX reverse proxy.

## Final architecture

- Backend: Java 17, Spring Boot 3.1.6, Spring Data JPA, Spring Security
- Database: PostgreSQL with Flyway-driven schema setup and demo seed data
- Frontend: React + TypeScript + Vite
- Tenant model: X-Tenant-ID request header plus request-scoped tenant context
- Deployment model: EC2 Ubuntu host with systemd service on port 8081 and NGINX proxying HTTPS traffic to the app

## Core workflow

Fabric rolls and production lots move through the following stages:

- RECEIVED
- CUTTING
- STITCHING
- WASHING
- FINISHING
- PACKING
- COMPLETED
- DISPATCHED

The application records stage movement and exposes current lot and roll data for the active tenant.

## Repository layout

- Backend source: src/main/java/com/futurezminds/inventory
- Configuration: src/main/resources/application.properties
- Database migrations: src/main/resources/db/migration
- Frontend source: frontend/
- Tenant enforcement: src/main/java/com/futurezminds/inventory/tenant

## Database and migration model

PostgreSQL is the source of truth. Flyway runs on startup and applies the migration files in src/main/resources/db/migration.

Included migrations:

- V1__init.sql: core schema for production stages, lots, history, and rolls
- V2__seed_sample_data.sql: demo tenant sample lots and rolls
- V3__enable_rls.sql: row-level security setup for tenant isolation

## Tenant behavior

Every API request is expected to carry the X-Tenant-ID header. The tenant filter resolves the active tenant for the request and constrains data access to that tenant.

This design is compatible with multi-tenant operations and Postgres row-level security patterns.

## Local development

### 1. Start PostgreSQL

```bash
docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 2. Run the backend

```bash
mvn clean package
mvn spring-boot:run
```

The runtime uses these environment overrides if needed:

- DB_URL
- DB_USERNAME
- DB_PASSWORD

Default configuration is PostgreSQL on localhost:5432 with the inventory_db database.

### 3. Run the frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend dev server runs on http://localhost:5173 and defaults to the local backend at http://localhost:8081/api unless VITE_API_BASE is provided.

## Important API endpoints

- GET /api/lots — list lots for the active tenant
- POST /api/lots — create a lot
- POST /api/lots/{id}/move — stage movement and history entry
- GET /api/lots/{id}/history — lot history
- GET /api/rolls — list rolls for the active tenant

## Seed data

The project seeds sample lot and roll data for the demo tenant as part of the migration flow. That provides immediate data visibility and validates the tenant-aware API without relying on an H2 in-memory database.

## Production deployment assumptions

- PostgreSQL is the runtime database.
- Flyway is enabled and manages schema creation and seed data.
- The app is deployed as a single service behind port 8081.
- NGINX terminates HTTPS and proxies requests to the backend on /api.
- The frontend can either call the same host /api or use VITE_API_BASE override for custom routing.

## Verification and status

The project is configured as a PostgreSQL-backed production application rather than a demo-only H2 setup. The Java build is validated with Maven, and the live backend is expected to run on port 8081 in a managed EC2 environment.

### Backend

```bash
mvn -DskipTests package
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The default frontend API target is:

- Local dev: http://localhost:8081/api
- Production domain: same-origin /api when served from the deployed site
- Override: set VITE_API_BASE to a custom backend URL
