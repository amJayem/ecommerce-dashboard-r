# CORS Troubleshooting Guide

## Problem: "strict-origin-when-cross-origin" Error

This error occurs when the backend server doesn't allow requests from your frontend origin due to CORS (Cross-Origin Resource Sharing) configuration.

## Solution: Configure Backend CORS

### Step 1: Find Your Frontend URL

Your Vite dev server typically runs on:
- **Default**: `http://localhost:5173`
- Check your terminal where you ran `npm run dev` to see the exact port

### Step 2: Update Backend CORS Configuration

In your backend `.env` file, add your frontend URL to `CORS_ORIGINS`:

```env
# CORS (comma-separated list of allowed origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:3001
```

**Important**: 
- Include the exact URL including the port number
- Use `http://` (not `https://`) for local development
- Separate multiple origins with commas (no spaces)

### Step 3: Ensure Backend Allows Credentials

Your backend CORS configuration must allow credentials. In NestJS, this typically looks like:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true, // IMPORTANT: Must be true for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Step 4: Restart Backend Server

After updating the `.env` file:
1. Stop the backend server (Ctrl+C)
2. Restart it: `npm run dev` or `npm start`

### Step 5: Verify Configuration

Check that:
- ✅ Backend is running on `http://localhost:3456`
- ✅ Frontend URL is in `CORS_ORIGINS`
- ✅ `credentials: true` is set in backend CORS config
- ✅ Frontend uses `withCredentials: true` (already configured ✅)

## Common Issues

### Issue: Still getting CORS error after configuration

**Solutions:**
1. **Clear browser cache** - Sometimes browsers cache CORS headers
2. **Check exact URL** - Ensure no trailing slashes or typos
3. **Verify backend restarted** - Environment variables only load on startup
4. **Check browser console** - Look for specific CORS error messages

### Issue: Cookies not being set

**Solutions:**
1. Ensure `credentials: true` in backend CORS
2. Ensure `withCredentials: true` in frontend axios config (already done ✅)
3. Check browser DevTools → Application → Cookies to see if cookies are set

### Issue: Different ports

If your frontend runs on a different port:
- Add that specific port to `CORS_ORIGINS`
- Example: `CORS_ORIGINS=http://localhost:5173,http://localhost:5174`

## Testing

After configuration, test the login:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Check the login request:
   - Status should be `200 OK` (not CORS error)
   - Response headers should include `Set-Cookie`
   - Request headers should include `Cookie` on subsequent requests

## Production

For production, update `CORS_ORIGINS` to include your production frontend URL:

```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Make sure to:
- Use `https://` in production
- Remove localhost URLs (or keep for development only)
- Use environment-specific `.env` files

