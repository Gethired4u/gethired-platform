#!/bin/bash
# One-time setup script for the EC2 server
# Run once after connecting via SSH:  bash setup-server.sh
set -e

PROJECT_DIR=~/gethired-platform
REPO_URL=https://github.com/Gethired4u/gethired-platform.git

echo "======================================"
echo " GetHired4U — EC2 Server Setup"
echo "======================================"

# ── 1. System packages ────────────────────────────────────────────────────
echo ">>> Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y nginx python3 python3-pip python3-venv git curl

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────
echo ">>> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ── 3. Clone or update repo ───────────────────────────────────────────────
echo ">>> Cloning repository..."
if [ -d "$PROJECT_DIR" ]; then
  cd $PROJECT_DIR && git pull origin main
else
  git clone $REPO_URL $PROJECT_DIR
  cd $PROJECT_DIR
fi

# ── 4. Backend: Python venv + dependencies ───────────────────────────────
echo ">>> Setting up Python virtual environment..."
cd $PROJECT_DIR/backend
python3 -m venv venv
./venv/bin/pip install --upgrade pip --quiet
./venv/bin/pip install -r requirements.txt --quiet

# ── 5. Frontend: build ────────────────────────────────────────────────────
echo ">>> Building frontend..."
cd $PROJECT_DIR/frontend
npm ci --silent
npm run build

# ── 6. Copy frontend to Nginx root ────────────────────────────────────────
echo ">>> Deploying frontend..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# ── 7. Nginx config — only install if SSL certs don't exist yet ───────────
echo ">>> Configuring Nginx..."
if [ ! -f "/etc/letsencrypt/live/gethired4u.com/fullchain.pem" ]; then
  echo "--- SSL not found, installing HTTP-only config first ---"
  sudo cp $PROJECT_DIR/deploy/nginx.conf /etc/nginx/sites-available/gethired4u
else
  echo "--- SSL cert exists, keeping current Nginx config ---"
fi
sudo ln -sf /etc/nginx/sites-available/gethired4u /etc/nginx/sites-enabled/gethired4u
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx

# ── 8. systemd service ────────────────────────────────────────────────────
echo ">>> Setting up backend service..."
sudo cp $PROJECT_DIR/deploy/gethired-backend.service /etc/systemd/system/gethired-backend.service
sudo systemctl daemon-reload
sudo systemctl enable gethired-backend
sudo systemctl start gethired-backend

# ── 9. Sudoers — allow deploy user to restart services without password ───
echo ">>> Configuring sudoers for CI/CD..."
echo "ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart gethired-backend, /bin/systemctl reload nginx, /bin/rm, /bin/cp" | sudo tee /etc/sudoers.d/gethired-deploy > /dev/null

echo ""
echo "======================================"
echo " Setup complete! ✅"
echo " Backend: $(sudo systemctl is-active gethired-backend)"
echo " Nginx:   $(sudo systemctl is-active nginx)"
echo ""
echo " ⚠️  IMPORTANT: Copy your .env file to:"
echo "    $PROJECT_DIR/backend/.env"
echo "======================================"
