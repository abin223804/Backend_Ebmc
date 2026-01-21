# Cookie Persistence Fix Guide

## Problem
Cookies are being cleared when refreshing/reloading the webpage instead of persisting until logout.

## Backend Changes Made ✅

### 1. Changed `sameSite` to "none" with `secure: true`
- **Files**: `adminController.js`, `userController.js`
- **Why**: Your frontend and backend are on different domains (cross-origin), so cookies need `sameSite: "none"` to work
- **Important**: `sameSite: "none"` REQUIRES `secure: true`, which means:
  - ✅ Works with HTTPS (production)
  - ⚠️ In development (HTTP), you may need to use a proxy or test with HTTPS
  - Some browsers may block cookies with `sameSite: "none"` over HTTP

### 2. Re-set cookies in refresh token endpoints
- **Files**: `adminController.js` (refreshAdminToken), `userController.js` (refreshUserToken)
- **Why**: Cookies need to be re-set on each refresh to ensure they persist
- **Fix**: Added `res.cookie()` call in both refresh token functions

### 3. Updated CORS configuration
- **File**: `app.js`
- **Changes**:
  - Added `"Cookie"` to `allowedHeaders`
  - Added `exposedHeaders: ["Set-Cookie"]`
  - Configured helmet to not interfere with cookies

## Frontend Requirements ⚠️

**CRITICAL**: The backend is now configured correctly, but the frontend MUST do the following:

### 1. Include credentials in ALL requests
```javascript
// Using fetch
fetch('http://your-backend-url/endpoint', {
  method: 'POST',
  credentials: 'include',  // ⚠️ REQUIRED!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})

// Using axios
axios.post('http://your-backend-url/endpoint', data, {
  withCredentials: true  // ⚠️ REQUIRED!
})

// Using axios globally (recommended)
axios.defaults.withCredentials = true;
```

### 2. Call refresh token endpoint on page load
The frontend should automatically call the refresh token endpoint when the page loads to get a new access token:

```javascript
// On app initialization or page load
async function initAuth() {
  try {
    // For admin
    const response = await fetch('http://your-backend-url/admin/refresh-Admin', {
      method: 'POST',
      credentials: 'include'  // This sends the cookie
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store the new access token
      localStorage.setItem('accessToken', data.data.accessToken);
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Redirect to login if refresh fails
  }
}

// Call this when app loads
initAuth();
```

### 3. Handle 401 errors by calling refresh
When an API call returns 401 (Unauthorized), the frontend should:
1. Call the refresh token endpoint
2. Retry the original request with the new access token

```javascript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh the token
        const refreshResponse = await axios.post('/admin/refresh-Admin', {}, {
          withCredentials: true
        });
        
        const newAccessToken = refreshResponse.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Testing Checklist

### Backend (Already Fixed) ✅
- [x] Cookies use `sameSite: "none"` with `secure: true`
- [x] Refresh token endpoints re-set cookies
- [x] CORS allows credentials
- [x] CORS exposes Set-Cookie header
- [x] Helmet doesn't interfere with cookies

### Frontend (YOU NEED TO CHECK) ⚠️
- [ ] All API requests include `credentials: 'include'` (fetch) or `withCredentials: true` (axios)
- [ ] Refresh token endpoint is called on page load
- [ ] 401 errors trigger token refresh
- [ ] Access token is stored in localStorage/sessionStorage
- [ ] Refresh token is ONLY in httpOnly cookie (never in localStorage)

## Common Issues

### Issue: Cookies still disappear on refresh
**Solution**: Make sure frontend calls the refresh token endpoint on page load with `credentials: 'include'`

### Issue: CORS error when sending cookies
**Solution**: Ensure frontend origin is in the `allowedOrigins` array in `app.js`

### Issue: Cookies work in Postman but not in browser
**Solution**: Browser requires `credentials: 'include'` in fetch or `withCredentials: true` in axios

## Endpoints

### Admin
- Login: `POST /admin/login-Admin`
- Refresh: `POST /admin/refresh-Admin` (requires cookie)
- Logout: `POST /admin/logout-Admin`

### User
- Login: `POST /user/login-user`
- Refresh: `POST /user/refresh-user` (requires cookie)
- Logout: `POST /user/logout-user`

## Cookie Names
- Admin: `refreshToken`
- User: `userRefreshToken`

These cookies are httpOnly and cannot be accessed via JavaScript - they are automatically sent with requests when `credentials: 'include'` is set.
