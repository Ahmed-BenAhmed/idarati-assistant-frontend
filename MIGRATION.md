# Migration to React Query with Backend API

## Overview
The chatbot has been migrated from using the Gemini service directly to using a custom backend API with React Query for state management.

## New Files Created

### 1. `apiClient.ts`
HTTP client for interacting with the backend API endpoints:
- **Health Check**: `GET /health` - Check API status
- **Retrieve**: `POST /retrieve` - Test retrieval quality based on user input
- **Ask**: `POST /ask` - Full retrieval + AI response flow

### 2. `hooks/useIdaratiApi.ts`
React Query hooks for API interactions:
- `useHealthCheck()` - Query hook for health monitoring (refetches every 30s)
- `useRetrieve()` - Mutation hook for testing retrieval
- `useAsk()` - Mutation hook for full chat functionality

### 3. `.env.example`
Environment variables template for configuration

## Changes Made

### Modified Files

1. **`package.json`**
   - Added `@tanstack/react-query@^5.62.14`
   - Added `@tanstack/react-query-devtools@^5.62.14`

2. **`App.tsx`**
   - Wrapped app with `QueryClientProvider`
   - Replaced `askIdaratiWithRetrieval()` with `useAsk()` hook
   - Removed direct Gemini service dependency
   - Added React Query DevTools for debugging

3. **Removed direct dependency on:**
   - `geminiService.ts` functions in App.tsx

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the API base URL if needed:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

### Retrieve (Test retrieval quality)
```bash
curl -X POST http://localhost:8000/retrieve \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "كيفاش ندير بطاقة التعريف الوطنية؟",
    "match_threshold": 0.5,
    "match_count": 3
  }'
```

### Ask (Full chat flow)
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "كيفاش ندير بطاقة التعريف الوطنية؟",
    "match_threshold": 0.5,
    "match_count": 3
  }'
```

## Request/Response Types

### AskRequest
```typescript
{
  prompt: string;
  match_threshold?: number; // default: 0.5
  match_count?: number;      // default: 3
}
```

### StructuredResponse
```typescript
{
  summary: string;
  checklist: string[];
  legalCitation?: string;
  quickActions: string[];
  procedureLink: string;
  thematicLink: string;
}
```

### RetrieveResponse
```typescript
{
  results: any[];
  count: number;
}
```

## Usage Example

```typescript
import { useAsk } from './hooks/useIdaratiApi';

function MyComponent() {
  const askMutation = useAsk();

  const handleAsk = async () => {
    try {
      const result = await askMutation.mutateAsync({
        prompt: "كيفاش ندير بطاقة التعريف الوطنية؟",
        match_threshold: 0.5,
        match_count: 3,
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleAsk} disabled={askMutation.isPending}>
        {askMutation.isPending ? 'Loading...' : 'Ask'}
      </button>
    </div>
  );
}
```

## React Query Features

- **Automatic retries** on failure (configured to 1 retry)
- **Loading states** via `isPending`
- **Error handling** via mutation error states
- **DevTools** for debugging queries and mutations
- **No refetch on window focus** for better UX

## Running the Application

1. Ensure backend API is running on `http://localhost:8000`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Benefits of This Architecture

1. **Separation of Concerns**: API logic separated from UI components
2. **Better State Management**: React Query handles loading, error, and success states
3. **Type Safety**: Full TypeScript support for requests and responses
4. **Debugging**: React Query DevTools for inspecting API calls
5. **Scalability**: Easy to add new endpoints and hooks
6. **Testing**: Easier to mock API calls in tests
7. **Caching**: React Query provides built-in caching (though disabled for mutations)
