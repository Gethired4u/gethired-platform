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
