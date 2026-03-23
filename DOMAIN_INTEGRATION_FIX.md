# 🚀 GetHired Platform - Backend-Frontend Integration Fix

## The Issue
❌ **Admin page works locally but fails on another machine**

This happens because the frontend is configured to connect to `localhost:8000`, which doesn't exist on other machines.

---

## The Solution
✅ **Use environment variables to configure the backend URL**

### For Same Machine (Local Development)
No configuration needed - everything already works!
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

### For Different Machines

**Step 1: Start Backend on Machine A**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Note the IP address shown or get it with:
- **Windows**: `ipconfig` (look for "IPv4 Address")
- **Mac/Linux**: `ifconfig` (look for "inet")

Example: `192.168.1.100`

**Step 2: Configure Frontend on Machine B**

Edit `frontend/.env.local`:
```
VITE_API_BASE_URL=http://192.168.1.100:8000
```

**Step 3: Start Frontend**
```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## ✅ Verification Checklist

- [ ] Backend running: `curl http://[backend-ip]:8000/health`
- [ ] Frontend `.env.local` created with correct IP
- [ ] Frontend can reach backend: Check browser DevTools Network tab
- [ ] Admin page loads and shows user table

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Unable to connect" in admin | Backend not running | Start backend with `python -m uvicorn main:app --host 0.0.0.0 --port 8000` |
| CORS error | Frontend + backend on different machines but CORS not enabled | Already enabled in code - no fix needed |
| "Connection refused" | Wrong IP in `.env.local` | Get IP with `ipconfig` and update `.env.local` |
| Network error | Firewall blocking port 8000 | Allow port 8000 in firewall settings |

---

## Environment File Reference

### `.env.example` (Read-only template)
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### `.env.local` (Your local config - don't commit)
Update this file for your specific machine setup:
```
# Local network backend
VITE_API_BASE_URL=http://192.168.1.100:8000

# Or production backend
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Backend Code Already Handles This ✓

The backend is already configured to accept cross-origin requests:

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✓ Allows any frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Frontend Code Already Handles This ✓

The frontend reads the environment variable:

```javascript
// In frontend/src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 10000,
});
```

---

## Quick Setup Script (Windows)

```bash
# For backend (Machine 1)
setup.bat backend

# For frontend (Machine 2)
setup.bat frontend

# For testing connectivity
setup.bat test
```

---

## Summary

| Scenario | Backend Start | Frontend .env.local | Works On |
|----------|---------------|-------------------|----------|
| Same machine | `--host 127.0.0.1` | `localhost:8000` | localhost only |
| Different machines | `--host 0.0.0.0` | `backend-ip:8000` | same network |
| Production | Deployed domain | `https://domain` | internet |

**The magic line:** Make sure `frontend/.env.local` VITE_API_BASE_URL points to where backend is actually running! 🎯
