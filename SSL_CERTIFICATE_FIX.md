# 🔧 SSL Certificate Fix - Permission Denied Issue

## Problem
```
ls: cannot access '/etc/letsencrypt/live/gethired4u.com/': Permission denied
```

This is normal! Certificate files are protected. Let me show you how to check and fix this.

---

## Step 1: Check Certificate Status (Run on EC2)

```bash
# Check if certbot certificates exist
sudo certbot certificates

# If no certificates, create one:
sudo certbot certonly --standalone -d gethired4u.com
```

---

## Step 2: Check Certificate Files (Run on EC2)

```bash
# Check if files exist (with sudo)
sudo ls -la /etc/letsencrypt/live/gethired4u.com/

# Expected output:
# -rw-r--r-- 1 root root  692 Mar 23 13:45 cert.pem
# -rw-r--r-- 1 root root  3584 Mar 23 13:45 chain.pem
# -rw-r--r-- 1 root root  4276 Mar 23 13:45 fullchain.pem
# -rw-r--r-- 1 root root  1704 Mar 23 13:45 privkey.pem
```

---

## Step 3: Fix File Permissions (Run on EC2)

```bash
# Make certificate files readable by your user
sudo chmod 644 /etc/letsencrypt/live/gethired4u.com/privkey.pem
sudo chmod 644 /etc/letsencrypt/live/gethired4u.com/fullchain.pem

# Verify permissions
sudo ls -la /etc/letsencrypt/live/gethired4u.com/
```

---

## Step 4: Kill Any Running Backend (Run on EC2)

```bash
# Find and kill running backend
pkill -f uvicorn

# Verify it's killed
ps aux | grep uvicorn
```

---

## Step 5: Start Backend with HTTPS (Run on EC2)

```bash
cd /home/ubuntu/gethired-platform/backend

# Start with HTTPS
python -m uvicorn main:app \
  --ssl-keyfile=/etc/letsencrypt/live/gethired4u.com/privkey.pem \
  --ssl-certfile=/etc/letsencrypt/live/gethired4u.com/fullchain.pem \
  --host 0.0.0.0 \
  --port 8000

# You should see:
# INFO:     Uvicorn running on https://0.0.0.0:8000
```

---

## Step 6: Test Backend (Run on EC2 or Local)

```bash
# Test from EC2
curl https://gethired4u.com:8000/health

# Or test from your local machine
curl https://gethired4u.com:8000/health -k
```

---

## Step 7: Test in Browser

1. Visit: `https://gethired4u.com/admin`
2. Clear browser cache: `Ctrl+Shift+Delete`
3. Check DevTools Network tab
4. Should see successful `/users` request ✅

---

## 🆘 If Still Not Working

### Check 1: AWS Security Group
Make sure port 8000 is open in AWS Security Group.

### Check 2: Certificate Expiration
```bash
sudo certbot certificates
# Check "Expiry Date"
```

### Check 3: Backend Process
```bash
ps aux | grep uvicorn
# Should show the process running
```

### Check 4: Test Direct Access
Visit: `https://gethired4u.com:8000/health` in browser
- You might see certificate warning (click "Proceed")
- Should show: `{"status":"ok"}`

---

## 📋 Quick Commands Summary

**On EC2 (SSH):**
```bash
# Check certificates
sudo certbot certificates

# If none exist, create:
sudo certbot certonly --standalone -d gethired4u.com

# Fix permissions
sudo chmod 644 /etc/letsencrypt/live/gethired4u.com/privkey.pem
sudo chmod 644 /etc/letsencrypt/live/gethired4u.com/fullchain.pem

# Kill old backend
pkill -f uvicorn

# Start new backend
cd /home/ubuntu/gethired-platform/backend
python -m uvicorn main:app --ssl-keyfile=/etc/letsencrypt/live/gethired4u.com/privkey.pem --ssl-certfile=/etc/letsencrypt/live/gethired4u.com/fullchain.pem --host 0.0.0.0 --port 8000
```

**Test from anywhere:**
```bash
curl https://gethired4u.com:8000/health -k
```

---

## ✅ Expected Results

After following these steps:

- [ ] Certificate files exist and are readable
- [ ] Backend starts with HTTPS
- [ ] `curl https://gethired4u.com:8000/health` works
- [ ] Admin page loads without SSL errors
- [ ] Users table appears

**Run the commands above on your EC2 instance!** 🚀
