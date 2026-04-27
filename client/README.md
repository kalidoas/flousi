# Flousi Client (Step 2)

React + Vite + TailwindCSS scaffold for Flousi.

## Run

```powershell
Set-Location "D:\APP2\flousi\client"
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:4000`.

## Production

- Deploy this folder to Vercel.
- Set `VITE_API_BASE_URL` to your Railway API URL, for example: `https://flousi-server.up.railway.app/api`
- Keep `vercel.json` to support SPA routing.
- If you change the API host later, redeploy so the env var is baked into the build.

