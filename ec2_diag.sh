#!/bin/bash
set -e

echo '--- postgres version ---'
psql --version || true

echo '--- DB list ---'
sudo -u postgres psql -tAc "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;" || true

echo '--- table check ---'
sudo -u postgres psql -d inventory_db -tAc "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" || true

echo '--- lot count ---'
sudo -u postgres psql -d inventory_db -tAc "SELECT count(*) FROM lots;" || true

echo '--- app log ---'
sudo journalctl -u inventory-app.service -n 200 --no-pager || true

echo '--- env dump ---'
systemctl show inventory-app.service --property=Environment,ExecStart,WorkingDirectory,User || true
