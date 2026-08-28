#!/bin/bash
set -e

printf '%s\n' '--- set postgres password ---'
sudo -u postgres psql -v ON_ERROR_STOP=1 -d postgres <<'SQL'
ALTER USER postgres WITH PASSWORD 'postgres';
SQL

printf '%s\n' '--- test psql login ---'
PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d inventory_db -tAc "SELECT count(*) FROM lots;"

printf '%s\n' '--- restart service ---'
sudo systemctl restart inventory-app.service || true
sleep 15

printf '%s\n' '--- status ---'
sudo systemctl status inventory-app.service --no-pager --lines=40 || true

printf '%s\n' '--- api check ---'
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 80 || true
