# Multi-Machine Setup Guide for GetHired Platform

## Problem
The admin page and other features fail on another machine because the frontend is hardcoded to connect to `localhost:8000`, which doesn't exist on that machine.

## Solution: Environment Configuration

### For Development (Same Machine)
If backend and frontend run on the **same machine**:

**Frontend Setup:**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if needed (default is usually fine for same machine)
npm run dev
```

The API will connect to `http://127.0.0.1:8000`

### For Different Machines

**On Backend Machine:**
1. Start the backend:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Note the machine IP address (e.g., `192.168.1.100`)

**On Frontend Machine:**
1. Create `.env.local` in the frontend directory:
```bash
cd frontend
cp .env.example .env.local
```

2. Edit `.env.local` with the backend machine's IP:
```
VITE_API_BASE_URL=http://192.168.1.100:8000
```

3. Start the frontend:
```bash
npm run dev
```

Now visit `http://localhost:5173` and the admin page should work.

### For Production Deployment

Update `.env.local` to point to your production domain:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Backend CORS Configuration
The backend (`backend/main.py`) already has CORS enabled:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

**Admin page shows "Unable to load users":**
- Check browser DevTools Network tab
- Verify backend is running and accessible
- Confirm `.env.local` has the correct API URL
- Try `curl http://[backend-ip]:8000/health` to test connectivity

**CORS errors in browser console:**
- Ensure backend CORS middleware is active (it is by default)
- Backend must be running on accessible IP (use `0.0.0.0` not `127.0.0.1`)

**Network error when connecting:**
- Verify firewall allows port 8000
- Check IP address is reachable: `ping [backend-ip]`
- Ensure both machines are on same network (or use public IP for production)

## Quick Test

### Test Backend Health:
```bash
curl http://[backend-ip]:8000/health
# Should return: {"status":"ok"}
```

### Test API from Frontend Console:
Open browser DevTools Console and run:
```javascript
fetch('http://[backend-ip]:8000/users')
  .then(r => r.json())
  .then(d => console.log(d))
```

