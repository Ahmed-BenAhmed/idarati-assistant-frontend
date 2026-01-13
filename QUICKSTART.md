# Quick Start Guide

## What Changed?

Your Idarati Assistant now uses a **backend API** instead of calling Gemini directly from the frontend.

## New Architecture

```
Frontend (React + React Query)
    ↓
Backend API (FastAPI on localhost:8000)
    ↓
Supabase + Gemini/HuggingFace
```

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```
   
   Update if your backend runs on a different port:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start your backend API** (must be running):
   ```bash
   # In your backend directory
   python main.py  # or however you start your FastAPI server
   ```

4. **Start the frontend**:
   ```bash
   npm run dev
   ```

## Testing

### Test Backend Connection
Open browser console and check React Query DevTools (bottom-left icon)

### Test Retrieval Quality
You can now import and use the `RetrieveDebug` component in your app to test how well the retrieval works:

```tsx
import { RetrieveDebug } from './components/RetrieveDebug';

// Add anywhere in your app for debugging
<RetrieveDebug />
```

### API Endpoints

- **Health**: `http://localhost:8000/health`
- **Retrieve**: `http://localhost:8000/retrieve` (test retrieval only)
- **Ask**: `http://localhost:8000/ask` (full chat with AI)

## Key Files

- `apiClient.ts` - HTTP client for API calls
- `hooks/useIdaratiApi.ts` - React Query hooks
- `App.tsx` - Updated to use React Query
- `components/RetrieveDebug.tsx` - Debug component for testing

## Troubleshooting

### "Failed to fetch" error
- Ensure backend is running on `http://localhost:8000`
- Check CORS is enabled on backend
- Verify `.env` file has correct `VITE_API_BASE_URL`

### Backend not responding
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"ok"}` or similar

### Check React Query state
Click the React Query DevTools icon (floating button) to see:
- Active queries/mutations
- Loading states
- Error messages
- Cached data

## Benefits

✅ Cleaner code separation  
✅ Better error handling  
✅ Loading states managed automatically  
✅ Easy to add new endpoints  
✅ Debug tools included  
✅ Type-safe API calls  
