# ⚡ HTTPS Setup - Quick Checklist

## 🎯 Goal
Fix: `https://gethired4u.com/admin` → Call `https://api.gethired4u.com:8000` (no Mixed Content error)

---

## 📋 Checklist (In Order)

### ☑️ Step 1: Add DNS Record (2 min)

Go to your domain registrar:

```
Type: A Record
Name: api
Value: 3.83.57.208
TTL: 3600 (or Auto)
```

**Save** → Wait 5-10 minutes for propagation

Test: `ping api.gethired4u.com`

---

### ☑️ Step 2: Get SSL Certificate (5 min)

SSH to AWS EC2:
```bash
ssh -i your-key.pem ec2-user@3.83.57.208
```

Install Certbot:
```bash
sudo yum install certbot -y
```

Get certificate for your subdomain:
```bash
sudo certbot certonly --standalone -d api.gethired4u.com
```

✅ Certificate saved to:
- `/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem`
- `/etc/letsencrypt/live/api.gethired4u.com/privkey.pem`

---

### ☑️ Step 3: Start Backend with HTTPS (5 min)

On AWS EC2, stop current backend if running (Ctrl+C).

Start with HTTPS:
```bash
cd /home/ec2-user/gethired-platform/backend

python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/api.gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem \
  --host 0.0.0.0 --port 8000
```

You should see:
```
Uvicorn running on https://0.0.0.0:8000
```

---

### ☑️ Step 4: Test Backend

From your local machine:
```bash
curl https://api.gethired4u.com:8000/health
```

✅ Should return: `{"status":"ok"}`

---

### ☑️ Step 5: Clear Frontend Cache

Your `.env.local` is already updated:
```
VITE_API_BASE_URL=https://api.gethired4u.com:8000
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

---

### ☑️ Step 6: Test Admin Page

Visit: `https://gethired4u.com/admin`

Check browser DevTools:
- Network tab → Look for `/users` request
- Should show: `https://api.gethired4u.com:8000/users` ✅
- No Mixed Content error ✅
- User table loads ✅

---

## 🧪 Verification Commands

**Check DNS:**
```bash
nslookup api.gethired4u.com
# Should resolve to 3.83.57.208
```

**Test backend health:**
```bash
curl https://api.gethired4u.com:8000/health
```

**Test users endpoint:**
```bash
curl https://api.gethired4u.com:8000/users
```

**Check certificate validity:**
```bash
sudo certbot certificates
```

---

## ❌ If Still Not Working

### Check 1: Port 8000 Open?
AWS Security Group must allow inbound traffic on port 8000.

Go to AWS Console → Security Groups → Edit Inbound Rules

Add:
```
Protocol: TCP
Port: 8000
Source: 0.0.0.0/0 (or specific IP)
```

### Check 2: Firewall on EC2?
```bash
# Check if firewall is running
sudo systemctl status firewalld

# If running, open port 8000
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### Check 3: Backend Still Running?
```bash
ps aux | grep uvicorn
# Should show the uvicorn process running
```

### Check 4: Certificate Valid?
```bash
sudo certbot certificates
# Check expiration date
```

---

## 🔄 Next Time You Deploy

To keep backend running after you disconnect SSH:

**Use `tmux` or `screen`:**
```bash
tmux new-session -d -s backend

tmux send-keys -t backend "cd /home/ec2-user/gethired-platform/backend && python -m uvicorn main:app --ssl-keyfile=/etc/letsencrypt/live/api.gethired4u.com/privkey.pem --ssl-certfile=/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem --host 0.0.0.0 --port 8000" Enter

# Later, reconnect:
tmux attach-session -t backend
```

**Or use systemd** (see HTTPS_SETUP_GUIDE.md)

---

## 📧 Support

If you have issues, check:
1. DNS propagation (5-10 mins)
2. AWS Security Group (port 8000)
3. Backend process running (`ps aux | grep uvicorn`)
4. Certificate paths exist
5. Browser cache cleared

**Everything should work once these steps are done!** ✅
