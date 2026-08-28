#!/bin/bash
set -e

cd /home/ubuntu/app

echo '--- repair flyway checksum metadata ---'
PGPASSWORD=postgres mvn -q -DskipTests flyway:repair \
  -Dflyway.url=jdbc:postgresql://localhost:5432/inventory_db \
  -Dflyway.user=postgres \
  -Dflyway.password=postgres || {
  echo 'Flyway repair failed; falling back to baseline creation for an existing schema.'
  sudo -u postgres psql -d inventory_db -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS flyway_schema_history (
  installed_rank INTEGER NOT NULL PRIMARY KEY,
  version VARCHAR(50),
  description VARCHAR(200) NOT NULL,
  type VARCHAR(20) NOT NULL,
  script VARCHAR(1000) NOT NULL,
  checksum INTEGER,
  installed_by VARCHAR(100) NOT NULL,
  installed_on TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  execution_time INTEGER NOT NULL,
  success BOOLEAN NOT NULL
);
SQL
}

echo '--- rebuild jar ---'
mvn -q -DskipTests package

echo '--- restart service ---'
sudo systemctl daemon-reload
sudo systemctl restart inventory-app.service || true
sleep 20

echo '--- service status ---'
sudo systemctl status inventory-app.service --no-pager --lines=60 || true

echo '--- app logs ---'
sudo journalctl -u inventory-app.service -n 80 --no-pager || true

echo '--- api check ---'
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 80 || true
