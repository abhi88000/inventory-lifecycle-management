set -e
cd /home/ubuntu/app
printf '%s\n' '--- repo status ---'
git status --short --branch || true
printf '%s\n' '--- resetting to origin/main ---'
git fetch --all --prune || true
git reset --hard origin/main || true
printf '%s\n' '--- building jar ---'
mvn -q -DskipTests package
printf '%s\n' '--- jar list ---'
ls -l target/*.jar
printf '%s\n' '--- writing service file ---'
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
sudo systemctl stop inventory-app.service || true
sudo systemctl start inventory-app.service
sleep 20
printf '%s\n' '--- status ---'
sudo systemctl status inventory-app.service --no-pager --lines=80 || true
printf '%s\n' '--- journal ---'
sudo journalctl -u inventory-app.service -n 80 --no-pager || true
printf '%s\n' '--- db lot count ---'
sudo -u postgres psql -d inventory_db -tAc "SELECT count(*) FROM lots;" || true
printf '%s\n' '--- api check ---'
curl -sS -D - -H "X-Tenant-ID: demo" http://127.0.0.1:8081/api/lots | head -n 80 || true
