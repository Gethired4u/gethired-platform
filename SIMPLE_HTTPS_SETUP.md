# 🔒 HTTPS Setup - Single Domain (No Subdomain)

## Architecture
```
Frontend:  https://gethired4u.com:443 (port 443 - default HTTPS)
Backend:   https://gethired4u.com:8000 (port 8000 - with HTTPS)
```

Both use the same domain `gethired4u.com` with HTTPS ✅

---

## Setup Steps

### Step 1: Get SSL Certificate for Main Domain (If Not Already Done)

If you already have SSL for `gethired4u.com`, skip to Step 2.

SSH to EC2:
```bash
ssh -i your-key.pem ec2-user@3.83.57.208
```

Install Certbot:
```bash
sudo yum install certbot -y
```

Get certificate:
```bash
sudo certbot certonly --standalone -d gethired4u.com -d www.gethired4u.com
```

Certificates will be saved to:
```
/etc/letsencrypt/live/gethired4u.com/
├── fullchain.pem
├── privkey.pem
└── chain.pem
```

---

### Step 2: Start Backend with HTTPS

On EC2 instance:

Stop any running backend (Ctrl+C if running)

Start with HTTPS:
```bash
cd /home/ec2-user/gethired-platform/backend

python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/gethired4u.com/fullchain.pem \
  --host 0.0.0.0 \
  --port 8000
```

You should see:
```
Uvicorn running on https://0.0.0.0:8000
```

---

### Step 3: Verify Backend is Running

Test from any machine:
```bash
curl https://gethired4u.com:8000/health
# Should return: {"status":"ok"}
```

---

### Step 4: Frontend Configuration (Already Done!)

Your frontend `.env.local` is already configured:
```
VITE_API_BASE_URL=https://gethired4u.com:8000
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

Or if production deployed, clear browser cache and reload.

---

### Step 5: Test Admin Page

Visit: `https://gethired4u.com/admin`

Check browser DevTools Network tab:
- Request should go to: `https://gethired4u.com:8000/users` ✅
- No Mixed Content error ✅
- User table loads ✅

---

## ✅ Verification Commands

```bash
# Test backend health
curl https://gethired4u.com:8000/health

# Test users endpoint
curl https://gethired4u.com:8000/users

# Check certificate
sudo certbot certificates

# Check if port 8000 is open
curl -v https://gethired4u.com:8000/health
```

---

## 🔧 If Not Working

### Check 1: AWS Security Group
Allow inbound traffic on port 8000:

AWS Console → EC2 → Security Groups → Edit Inbound Rules

Add:
```
Protocol: TCP
Port: 8000
Source: 0.0.0.0/0
```

### Check 2: EC2 Firewall
```bash
sudo systemctl status firewalld

# If running, open port 8000
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

### Check 3: Backend Process
```bash
ps aux | grep uvicorn
# Should show the uvicorn process with SSL options
```

### Check 4: Certificate Paths
```bash
sudo certbot certificates
# Check expiration and paths
```

### Check 5: Browser Cache
```
Press: Ctrl+Shift+Delete
Clear: Cached images and files
Reload: https://gethired4u.com/admin
```

---

## 📋 Quick Checklist

- [ ] SSL certificate obtained for `gethired4u.com`
- [ ] Backend stopped (if running)
- [ ] Backend started with HTTPS on port 8000
- [ ] Health check works: `curl https://gethired4u.com:8000/health`
- [ ] Frontend `.env.local` has correct URL: `https://gethired4u.com:8000`
- [ ] Frontend restarted/cache cleared
- [ ] Admin page loads without Mixed Content error

---

## ⏸️ To Keep Backend Running After SSH Disconnect

Use `tmux`:

```bash
tmux new-session -d -s backend

tmux send-keys -t backend "cd /home/ec2-user/gethired-platform/backend && python -m uvicorn main:app --ssl-keyfile=/etc/letsencrypt/live/gethired4u.com/privkey.pem --ssl-certfile=/etc/letsencrypt/live/gethired4u.com/fullchain.pem --host 0.0.0.0 --port 8000" Enter

# Later, reconnect to view logs:
tmux attach-session -t backend

# Or run in background with nohup:
nohup python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/gethired4u.com/fullchain.pem \
  --host 0.0.0.0 \
  --port 8000 > backend.log 2>&1 &
```

---

## 🎉 Final Architecture

```
┌─────────────────────────────────────┐
│ Your Machine (Browser)              │
│ https://gethired4u.com/admin        │
│ (Frontend on port 443)              │
└──────────┬──────────────────────────┘
           │ HTTPS Request
           │ Port 443 → DNS resolves
           │
      ┌────▼─────────────────────────┐
      │ DNS: gethired4u.com          │
      │ IP: 3.83.57.208              │
      └────┬─────────────────────────┘
           │
┌──────────▼────────────────────────────┐
│ AWS EC2 (3.83.57.208)                │
│                                      │
│ Port 443:                            │
│ ├─ Frontend served here (optional)   │
│                                      │
│ Port 8000:                           │
│ ├─ FastAPI Backend                   │
│ ├─ HTTPS with SSL Certificate        │
│ ├─ gethired4u.com                    │
│ └─ All endpoints working ✅          │
└──────────────────────────────────────┘
```

---

## 📝 Summary

| What | Where | Protocol | Status |
|------|-------|----------|--------|
| Frontend served from | `gethired4u.com:443` | HTTPS | ✅ Already working |
| Backend API available on | `gethired4u.com:8000` | HTTPS | ⏳ Setup needed |
| Mixed Content error | — | — | ✅ Will be fixed |
| Frontend config | `.env.local` | — | ✅ Already updated |

**Time to complete: ~10 minutes** ⏱️
