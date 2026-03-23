# 🔒 HTTPS Production Setup - Mixed Content Fix

## Problem
❌ Frontend on HTTPS (`https://gethired4u.com`) → Cannot call HTTP backend (`http://3.83.57.208:8000`)
- Browsers block Mixed Content for security
- Error: "The page at 'https://...' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint"

## Solution
✅ Use API subdomain with HTTPS: `https://api.gethired4u.com`

---

## 📋 Step-by-Step Setup

### Step 1: DNS Configuration (5 minutes)
Go to your domain registrar (GoDaddy, Namecheap, etc.):

**Add new DNS A record:**
```
Name:   api
Type:   A
Value:  3.83.57.208
TTL:    3600
```

**Result:** `api.gethired4u.com` → `3.83.57.208`

---

### Step 2: Setup HTTPS on EC2 Backend (10 minutes)

SSH into your EC2 instance:
```bash
ssh -i your-key.pem ec2-user@3.83.57.208
```

**Install Certbot (Let's Encrypt client):**
```bash
sudo yum update -y
sudo yum install certbot -y
```

**Get free SSL certificate:**
```bash
sudo certbot certonly --standalone -d api.gethired4u.com -d www.api.gethired4u.com
```

This will download certificates to:
- `/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem`
- `/etc/letsencrypt/live/api.gethired4u.com/privkey.pem`

---

### Step 3: Update Backend to Use HTTPS

In your EC2 instance, update the backend startup command:

**Replace this:**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**With this:**
```bash
python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/api.gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
```

**Or create a startup script** (`start-backend.sh`):
```bash
#!/bin/bash
cd /path/to/backend
python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/api.gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem \
  --host 0.0.0.0 \
  --port 8000
```

Make it executable:
```bash
chmod +x start-backend.sh
./start-backend.sh
```

---

### Step 4: Verify Backend is Running on HTTPS

Test from any machine:
```bash
curl https://api.gethired4u.com:8000/health
# Should return: {"status":"ok"}
```

---

### Step 5: Update Frontend (Already Done!)

Your frontend `.env.local` is already configured:
```
VITE_API_BASE_URL=https://api.gethired4u.com:8000
```

**Restart frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Verification Checklist

After completing the steps above:

- [ ] DNS record created: `api.gethired4u.com` → `3.83.57.208`
- [ ] SSL certificate installed: `/etc/letsencrypt/live/api.gethired4u.com/`
- [ ] Backend running with HTTPS: `https://api.gethired4u.com:8000`
- [ ] Test health: `curl https://api.gethired4u.com:8000/health`
- [ ] Frontend has correct `.env.local`: `https://api.gethired4u.com:8000`
- [ ] Admin page loads without Mixed Content error
- [ ] Users appear in admin table

---

## 🔄 Certificate Auto-Renewal

SSL certificates expire after 90 days. Auto-renew them:

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup auto-renewal (cron job)
sudo crontab -e
```

Add this line:
```
0 0 1 * * certbot renew --quiet --post-hook "systemctl restart backend"
```

---

## 🧪 Full Testing

### Test 1: Backend Connectivity
```bash
curl https://api.gethired4u.com:8000/health
# Result: {"status":"ok"}
```

### Test 2: Users API
```bash
curl https://api.gethired4u.com:8000/users
# Result: [] or user list
```

### Test 3: Frontend Admin Page
1. Visit: `https://gethired4u.com/admin`
2. Check browser DevTools → Network tab
3. Verify request goes to: `https://api.gethired4u.com:8000/users`
4. No CORS or Mixed Content errors
5. User table loads

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| DNS not resolving | Wait 5-10 minutes for DNS propagation |
| Certificate error | Ensure Certbot ran successfully, check paths |
| Port 8000 blocked | Check AWS Security Group allows port 8000 |
| Mixed Content error still showing | Clear browser cache (Ctrl+Shift+Delete) + refresh |
| Backend won't start with SSL | Check file permissions: `sudo chmod 644 /etc/letsencrypt/live/.../privkey.pem` |

---

## 📁 File Structure (Backend)

```
/etc/letsencrypt/
├── live/
│   └── api.gethired4u.com/
│       ├── fullchain.pem      ← Use this for --ssl-certfile
│       ├── privkey.pem        ← Use this for --ssl-keyfile
│       ├── chain.pem
│       └── cert.pem
```

---

## 📊 Final Architecture

```
┌─────────────────────────────────────────┐
│   Your Machine                          │
│   https://gethired4u.com/admin          │
│   (Frontend - React/Vite)               │
└──────────┬──────────────────────────────┘
           │ HTTPS Request
           │
    ┌──────▼─────────────────────────────┐
    │ Reverse DNS Resolution              │
    │ api.gethired4u.com → 3.83.57.208    │
    └──────┬──────────────────────────────┘
           │
┌──────────▼─────────────────────────────┐
│   AWS EC2 Instance (3.83.57.208)       │
│   https://api.gethired4u.com:8000      │
│   FastAPI Backend (Python/Uvicorn)     │
│   ✅ HTTPS with SSL Certificate        │
│   ✅ CORS Enabled                      │
│   ✅ All Endpoints Available           │
└─────────────────────────────────────────┘
```

---

## ⏭️ Next: Automate with Systemd (Optional)

Create `/etc/systemd/system/gethired-backend.service`:

```ini
[Unit]
Description=GetHired FastAPI Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/gethired-platform/backend
ExecStart=/usr/bin/python3 -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/api.gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/api.gethired4u.com/fullchain.pem \
  --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable gethired-backend
sudo systemctl start gethired-backend
sudo systemctl status gethired-backend
```

---

## 🎉 Status

| Component | Status |
|-----------|--------|
| Frontend Config | ✅ Updated to HTTPS API subdomain |
| Backend Config | ⏳ Waiting for your SSL setup |
| DNS | ⏳ Waiting for your DNS record |
| Mixed Content Error | ❌ Will be fixed once HTTPS is live |

**Once you complete the EC2 steps above, the admin page will work perfectly!** 🚀
