# Idarati Assistant Frontend

React + Vite frontend for the Idarati Assistant. The UI talks to a backend API for retrieval and AI responses.

## Overview

- Frontend: React + TypeScript + Vite
- Data fetching: React Query
- Backend dependency: FastAPI API (default `http://localhost:8000`)

## Architecture

```
Frontend (React + React Query)
    ↓
Backend API (FastAPI on localhost:8000)
    ↓
Supabase + Gemini/HuggingFace
```

## Prerequisites

- Node.js (LTS recommended)
- Running backend API (see your backend repo)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an env file:
   ```bash
   cp .env.example .env
   ```
3. Update variables if needed:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Environment Variables

`VITE_API_BASE_URL` controls which backend the UI calls. Defaults to `http://localhost:8000` if not set.

If you are still using direct Gemini calls in a local setup, keep `GEMINI_API_KEY` in `.env.local`.

## Available Scripts

- `npm run dev` - Start the dev server
- `npm run build` - Production build
- `npm run preview` - Preview the production build locally

## Project Structure

```
apiClient.ts          # HTTP client for backend calls
hooks/useIdaratiApi.ts # React Query hooks
components/           # UI components
App.tsx               # App shell + providers
```

## Troubleshooting

- "Failed to fetch": confirm backend is running and `VITE_API_BASE_URL` matches
- Check backend health: `curl http://localhost:8000/health`
- Use React Query DevTools (floating button) to inspect requests

## More Docs

- `QUICKSTART.md` for a guided setup
- `MIGRATION.md` for details on the React Query + backend API change
