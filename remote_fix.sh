#!/bin/bash
set -e

echo '--- set postgres password ---'
sudo -u postgres psql -v ON_ERROR_STOP=1 -d postgres <<'SQL'
ALTER USER postgres WITH PASSWORD 'postgres';
SQL

echo '--- restart service ---'
sudo systemctl restart inventory-app.service || true
sleep 15

echo '--- status ---'
sudo systemctl status inventory-app.service --no-pager --lines=50 || true

echo '--- api check ---'
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 80 || true
