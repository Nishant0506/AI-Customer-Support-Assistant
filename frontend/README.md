# AI Support Coaching Frontend

React, Vite, JavaScript, Tailwind CSS, Lucide React, and Recharts frontend for the existing FastAPI customer-support coaching backend.

## Run

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The default API base URL is `http://127.0.0.1:8000`. Override it in `.env.local` using `VITE_API_BASE_URL`.

## Features

- Simulator, Manual, and Replay coaching modes
- Intent, sentiment, frustration, escalation, and response coaching panels
- RAG knowledge document upload and chat
- Post-interaction reports and JSON export
- Saved-session analytics dashboard

## Backend limitations

Manual conversation and Replay transcript state are browser-session state only. They are not permanently stored or retrieved from the backend. The existing backend session/database APIs are used unchanged. Report saving and analytics use the existing `/summary/post-interaction` and `/analytics/*` endpoints.
