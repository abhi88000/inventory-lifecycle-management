$ppk = 'C:\Users\oeb31\Downloads\inventory_management.ppk'
$script = @'
sudo tee /etc/nginx/sites-available/inventory-app >/dev/null <<'EOF'
server {
    listen 80;
    server_name inventory.futurezminds.in www.inventory.futurezminds.in;
    return 301 https://$host$request_uri;
}
