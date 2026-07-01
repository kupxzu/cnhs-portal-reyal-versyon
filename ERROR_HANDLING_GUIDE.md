# Global 404 & Error Handling Guide

## Overview
A comprehensive global error handling system has been implemented for both frontend (React) and backend (Laravel) to provide consistent 404 and error responses.

## Frontend Changes

### 1. Enhanced 404 Page (`src/pages/NotFoundPage.tsx`)
- Displays the current requested path
- Shows role-based navigation options
- Includes "Go Back" button
- Better UX with gradient background and improved styling

**Usage**: Automatically shown when user navigates to undefined routes via catch-all route `<Route path="*" element={<NotFoundPage />} />`

### 2. Error Boundary Component (`src/components/ErrorBoundary.tsx`)
- Catches React component errors
- Displays user-friendly error page
- Shows error details in development mode only
- Provides recovery options (Try Again, Go to Dashboard, Go Home)

**Usage**: Wrapped around the entire app in `App.tsx`

### 3. Error Handler Utility (`src/lib/errorHandler.ts`)
Handles API errors with specific messages for each HTTP status code:

**Usage Example**:
```typescript
import { showErrorToast, handleApiError } from '@/lib/errorHandler';

try {
  const response = await api.get('/some-endpoint');
} catch (error) {
  const apiError = handleApiError(error); // Returns structured error
  showErrorToast(error); // Shows toast with error message
}
```

**Supported Status Codes**:
- 400: Bad request
- 401: Unauthorized (automatically clears auth and redirects)
- 403: Forbidden
- 404: Resource not found
- 422: Validation error (includes error details)
- 429: Too many requests
- 500: Server error
- 503: Service unavailable

## Backend Changes

### 1. Exception Handler (`app/Exceptions/Handler.php`)
Centralized exception handling for:
- 404 Not Found
- HTTP Exceptions (400, 401, 403, etc.)
- Validation Exceptions (422)
- Authentication Exceptions (401)
- Authorization Exceptions (403)

**Features**:
- Returns JSON for API requests and requests expecting JSON
- Friendly error messages
- Includes request path and error details
- Consistent response format

### 2. Routes Fallback (`routes/web.php`)
- Added fallback route to handle undefined routes
- Returns JSON for API requests
- Delegates 404 to frontend for SPA routing

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "status": 404,
  "message": "Resource not found",
  "error": "Not Found or specific error details",
  "path": "/api/invalid-endpoint"
}
```

## Testing

### Frontend 404
Navigate to: `http://localhost:5173/non-existent-page`

### API 404
Make request to: `http://localhost:8000/api/invalid-endpoint`

### Error Boundary
The error boundary will catch any React component errors and display the error page.

## Integration with Existing Code

The error handling is already integrated:
- `App.tsx` is wrapped with `ErrorBoundary`
- Routes include catch-all `<Route path="*" element={<NotFoundPage />} />`
- Exception handler is registered in the service provider

## Best Practices

1. **Always use error handler** when making API calls:
   ```typescript
   catch (error) {
     showErrorToast(error);
   }
   ```

2. **Let the error boundary catch unexpected errors** - no need to wrap every component

3. **Use consistent response format** in your API endpoints:
   ```php
   return response()->json([
       'success' => true/false,
       'message' => '...',
       'data' => $data
   ]);
   ```

## Files Modified/Created
- ✅ `src/pages/NotFoundPage.tsx` - Enhanced
- ✅ `src/components/ErrorBoundary.tsx` - Created
- ✅ `src/lib/errorHandler.ts` - Created
- ✅ `src/App.tsx` - Added ErrorBoundary wrapper
- ✅ `app/Exceptions/Handler.php` - Created
- ✅ `routes/web.php` - Added fallback route
