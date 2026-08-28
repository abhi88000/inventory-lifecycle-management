#!/bin/bash
set -e

echo '--- schema fix ---'
sudo -u postgres psql -d inventory_db -v ON_ERROR_STOP=1 <<'SQL'
ALTER TABLE lot_stage_history ALTER COLUMN from_stage_id TYPE BIGINT;
ALTER TABLE lot_stage_history ALTER COLUMN to_stage_id TYPE BIGINT;
ALTER TABLE lots ALTER COLUMN current_stage_id TYPE BIGINT;
ALTER TABLE lots ALTER COLUMN size_ratios TYPE TEXT;
ALTER TABLE lots ALTER COLUMN size_quantities TYPE TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS washer VARCHAR(255);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS finisher VARCHAR(255);
ALTER TABLE lots ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(200) NOT NULL DEFAULT 'default_tenant';
ALTER TABLE lot_stage_history ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(200) NOT NULL DEFAULT 'default_tenant';
ALTER TABLE production_stages ALTER COLUMN id TYPE BIGINT;
ALTER TABLE rolls ALTER COLUMN id TYPE BIGINT;
SQL

echo '--- verify types ---'
sudo -u postgres psql -d inventory_db -tAc "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('production_stages','lots','lot_stage_history','rolls') AND (column_name LIKE '%stage%' OR column_name = 'id');"

echo '--- restart ---'
sudo systemctl restart inventory-app.service
sleep 20
sudo systemctl status inventory-app.service --no-pager --lines=30 || true

echo '--- api ---'
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 40 || true
