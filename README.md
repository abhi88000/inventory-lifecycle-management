# Stock Monitoring

Production-grade fabric roll and garment lot lifecycle tracking system. Built for tenant-aware operations with a Spring Boot API backed by PostgreSQL, Flyway migrations, and a mobile-first React frontend.

## Final architecture

- Backend: Java 17, Spring Boot 3.1.6, Spring Data JPA, Spring Security
- Database: PostgreSQL with Flyway-driven schema setup and seed data
- Frontend: React + TypeScript + Vite (mobile-first, collapsible sections, search)
- Tenant model: X-Tenant-ID header + request-scoped ThreadLocal context + Postgres RLS
- Deployment: EC2 Ubuntu with systemd service on port 8081, NGINX reverse proxy for HTTPS

## Production workflow

```
RECEIVED → CUTTING → STITCHING → WASHING → FINISHING → DISPATCHED
```

Each stage transition is recorded in lot_stage_history with a timestamp and quantity.

### Stage behavior

| Stage | In Progress shows | Eligible shows | Move action |
|-------|-------------------|-----------------|-------------|
| Cutting | Lots currently being cut | Available fabric rolls | Create lot from roll (roll is consumed) |
| Stitching | Lots in STITCHING | Lots in CUTTING | Move to Washing |
| Washing | Lots in WASHING | Lots in STITCHING | Move to Finishing |
| Finishing | Lots in FINISHING | Lots in WASHING | Dispatch to Warehouse |
| Warehouse | DISPATCHED + WAREHOUSE lots | — | Final stage |

### Key rules

- Moving a roll to Cutting creates a lot and **deletes the source roll** (roll is fully consumed).
- In-progress items can be advanced to the next stage from their own tab.
- Eligible items can be brought into the current stage from the previous stage's tab.
- Lot detail pages are read-only (view history, sizes, metadata) — no stage changes from there.

## Repository layout

```
src/main/java/com/futurezminds/inventory/
  controller/     REST endpoints (lots, rolls)
  service/        Business logic (create lot, move stage)
  entity/         JPA entities (Lot, Roll, ProductionStage, LotStageHistory)
  repository/     Spring Data repositories
  tenant/         TenantContext (ThreadLocal) + TenantFilter (header → context)
  security/       CORS + security config
  bootstrap/      StageSeeder (seeds demo data on first run)

src/main/resources/
  db/migration/   Flyway SQL migrations (V1 init, V2 seed, V3 RLS, V4 roll metadata)

frontend/src/
  pages/          Home, RollInventory, Cutting, Stitching, Washing, Finishing, Warehouse, LotDetail
  pages/StageSection.tsx    Reusable stage view (In Progress + Eligible + search)
  pages/CreateLotSheet.tsx  Lot creation form (used by Cutting + RollInventory)
  pages/StageHistorySheet.tsx  Stage transition history viewer
  pages/CollapsibleSection.tsx  Collapsible section wrapper
  api.ts          API client with tenant header
  search.ts       Client-side search helpers
  dateUtils.ts    Date formatting, age badges, oldest-first sorting
  icons.tsx       Shared SVG icon components
```

## Database

PostgreSQL is the source of truth. Flyway runs on startup and applies migrations in order.

| Migration | Purpose |
|-----------|---------|
| V1 | Core schema: stages, lots, history, rolls |
| V2 | Demo tenant seed data |
| V3 | Row-level security for tenant isolation |
| V4 | Roll brand + created_at metadata |

## Tenant model

Every request carries `X-Tenant-ID` header. `TenantFilter` resolves it into a `ThreadLocal` (`TenantContext`) and sets a Postgres session variable for RLS. When auth is added, the tenant should be derived from the authenticated principal instead of the raw header.

## Local development

```bash
# Start PostgreSQL
docker run --name inventory-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Run backend
mvn clean package
mvn spring-boot:run

# Run frontend (in another terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend dev: http://localhost:5173 → proxies to http://localhost:8081/api

## Production deployment

- Backend runs as a systemd service on port 8081
- NGINX terminates HTTPS and proxies `/api/*` to the backend
- Frontend static files served from `/var/www/html`
- Deploy: `git push` → SSH to EC2 → `git pull && mvn -DskipTests package && sudo systemctl restart inventory-app`
