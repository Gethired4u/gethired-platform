ls
cd .
ls
ls
ls
cd ../
ls
cd ../
ls
cd home
ls
cd ubuntu/
ls
cd backend/
LS
source venv/bin/activate
ls
uvicorn main:app --host 0.0.0.0 --port 8000
sudo nano /etc/systemd/system/backend.service
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl start backend
sudo systemctl enable backend
sudo systemctl restart backend
cd ../
cd frontend/
ls
npm install
sudo apt update
sudo apt install nodejs npm -y
ls
node -v
npm -v
sudo apt remove nodejs -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
ls
cd frontend/
ls
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt remove nodejs libnode-dev nodejs-doc -y
sudo apt autoremove -y
sudo rm -rf /var/lib/apt/lists/*
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
ls
node -v
npm -v
npm install
npm run dev
npm run dev -- --host 0.0.0.0
npm run build
ls
sudo nano /etc/nginx/sites-available/default
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
cd platform/
ls
rm backend/
rm -rf backend
ls
