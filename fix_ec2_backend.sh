set -e

echo "--- writing service file ---"
sudo tee /etc/systemd/system/inventory-app.service >/dev/null <<'EOF_SERVICE'
[Unit]
Description=Inventory Lifecycle Management
After=network.target

[Service]
WorkingDirectory=/home/ubuntu/app
Environment="DB_URL=jdbc:postgresql://localhost:5432/inventory_db"
Environment="DB_USERNAME=postgres"
Environment="DB_PASSWORD=postgres"
ExecStart=/usr/bin/java -jar /home/ubuntu/app/target/inventory-lifecycle-management-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF_SERVICE

sudo systemctl daemon-reload

echo "--- resetting postgres password ---"
sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"

echo "--- testing postgres auth ---"
PGPASSWORD=postgres psql -h localhost -U postgres -d inventory_db -c "SELECT current_user, current_database();"

echo "--- restarting app ---"
sudo systemctl restart inventory-app.service
sleep 20

sudo systemctl status inventory-app.service --no-pager --lines=60 || true

echo "--- api ---"
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 40 || true
