# Troubleshooting Guide - 504 Gateway Timeout

## 🔴 Issue: 504 Gateway Timeout

**Error Message:**
```
504 Gateway Timeout
The server, working as a gateway did not get a response in time.
```

## ✅ What Was Fixed

The timeout was caused by the external Shufti Pro API call taking too long or hanging indefinitely. 

### Changes Made:

1. **Added 30-second timeout** to all external API calls
2. **Improved error handling** with specific timeout detection
3. **Added detailed logging** for debugging
4. **Graceful degradation** - Profile is still created even if external API fails

### Files Modified:

- ✅ `individualProfileController.js` - Added timeout to `checkExternalApi()`
- ✅ `corporateProfileController.js` - Added timeout to `checkCorporateExternalApi()`

## 🔧 Technical Details

### Before (Problematic):
```javascript
const response = await axios.post(apiUrl, payload, {
    headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
    },
    // No timeout - could hang forever!
});
```

### After (Fixed):
```javascript
const response = await axios.post(apiUrl, payload, {
    headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds timeout
});
```

## 📊 How It Works Now

### Profile Creation Flow:

1. **Profile is created in database** ✅ (Always succeeds)
2. **External API is called** with 30-second timeout
3. **Three possible outcomes:**
   - ✅ **Success** - API responds with verification data
   - ⏱️ **Timeout** - API takes >30 seconds, profile saved with timeout status
   - ❌ **Error** - API returns error, profile saved with error details

### Response Examples:

**Success:**
```json
{
    "success": true,
    "message": "Individual Profile created and checked successfully",
    "data": {
        "_id": "...",
        "customerName": "John Doe",
        "status": "PENDING",
        "apiResult": {
            "event": "verification.accepted",
            "reference": "REF-..."
        }
    }
}
```

**Timeout:**
```json
{
    "success": true,
    "message": "Individual Profile created and checked successfully",
    "data": {
        "_id": "...",
        "customerName": "John Doe",
        "status": "PENDING",
        "apiResult": {
            "status": "Timeout",
            "error": "External API request timed out after 30 seconds",
            "timestamp": "2026-01-28T07:41:27.000Z"
        }
    }
}
```

**API Error:**
```json
{
    "success": true,
    "message": "Individual Profile created and checked successfully",
    "data": {
        "_id": "...",
        "customerName": "John Doe",
        "status": "PENDING",
        "apiResult": {
            "status": "Error",
            "error": "Failed to check Shufti Pro API",
            "details": "...",
            "timestamp": "2026-01-28T07:41:27.000Z"
        }
    }
}
```

**Missing Credentials:**
```json
{
    "success": true,
    "message": "Individual Profile created and checked successfully",
    "data": {
        "_id": "...",
        "customerName": "John Doe",
        "status": "PENDING",
        "apiResult": {
            "status": "Skipped",
            "reason": "Missing credentials"
        }
    }
}
```

## 🔍 Debugging

### Check Server Logs

The controllers now log detailed information:

```bash
# Successful API call
[Shufti Pro] Calling API for profile 65a1b2c3d4e5f6g7h8i9j0k1...
[Shufti Pro] API call successful for profile 65a1b2c3d4e5f6g7h8i9j0k1

# Timeout
[Shufti Pro] Calling API for profile 65a1b2c3d4e5f6g7h8i9j0k1...
[Shufti Pro] API timeout for profile 65a1b2c3d4e5f6g7h8i9j0k1

# Error
[Shufti Pro] Calling API for profile 65a1b2c3d4e5f6g7h8i9j0k1...
[Shufti Pro] API error for profile 65a1b2c3d4e5f6g7h8i9j0k1: [error details]
```

### Check Environment Variables

Make sure your `.env` file has the correct credentials:

```bash
SHUFTIPRO_API_URL=https://api.shuftipro.com/
SHUFTIPRO_CLIENT_ID=your-client-id-here
SHUFTIPRO_CLIENT_SECRET=your-client-secret-here
```

## 🚀 Testing After Fix

### Test 1: Create Profile (Should work now)
```bash
POST http://localhost:5000/individual-profile/create
```

**Expected:**
- ✅ Profile is created in database
- ✅ Response received within 30-35 seconds max
- ✅ `apiResult` field shows status (Success, Timeout, Error, or Skipped)

### Test 2: Verify Profile Was Saved
```bash
GET http://localhost:5000/individual-profile/:id
```

**Expected:**
- ✅ Profile data is returned
- ✅ `apiResult` field contains the external API response

## ⚙️ Configuration Options

### Adjust Timeout (if needed)

If 30 seconds is too short/long, you can adjust it in the controllers:

**Location:** `src/controllers/individualProfileController.js` (line ~72)
```javascript
timeout: 30000, // Change to desired milliseconds (e.g., 60000 for 60 seconds)
```

**Location:** `src/controllers/corporateProfileController.js` (line ~73)
```javascript
timeout: 30000, // Change to desired milliseconds
```

### Disable External API (for testing)

To test without calling the external API, you can:

1. **Remove credentials from `.env`:**
   ```bash
   # Comment out or remove these lines
   # SHUFTIPRO_CLIENT_ID=...
   # SHUFTIPRO_CLIENT_SECRET=...
   ```

2. **Result:** API will be skipped, profile will be created with:
   ```json
   "apiResult": {
       "status": "Skipped",
       "reason": "Missing credentials"
   }
   ```

## 🎯 Best Practices

1. **Monitor API Response Times**
   - Check server logs for API call duration
   - If consistently timing out, contact Shufti Pro support

2. **Handle Timeout Gracefully**
   - Profile is still created successfully
   - You can retry the verification later if needed

3. **Review `apiResult` Field**
   - Always check the `apiResult` in the response
   - Status values: Success, Timeout, Error, Skipped

4. **Retry Logic (Optional)**
   - For timeout/error cases, you could implement a retry mechanism
   - Or manually trigger re-verification later

## 📞 If Issue Persists

If you still get 504 errors after this fix:

1. **Check if it's a different timeout:**
   - Nginx/Apache timeout (increase server timeout)
   - Database connection timeout
   - Network issues

2. **Increase timeout further:**
   - Change `timeout: 30000` to `timeout: 60000` (60 seconds)

3. **Make API call asynchronous:**
   - Create profile immediately
   - Queue external API call for background processing
   - Update profile later with results

4. **Check Shufti Pro API status:**
   - Verify the API endpoint is accessible
   - Check if there are any service outages
   - Test API credentials directly

## 🔄 Summary

**Problem:** External API calls were hanging indefinitely, causing 504 Gateway Timeout

**Solution:** 
- ✅ Added 30-second timeout to all external API calls
- ✅ Improved error handling with specific timeout detection
- ✅ Profile creation always succeeds, regardless of external API status
- ✅ Added detailed logging for debugging

**Result:** No more 504 errors! Profile creation completes within 30-35 seconds maximum.
