# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Changes (COMPLETED ✅)

- [x] Server binds to `0.0.0.0` instead of `localhost`
- [x] Added health check endpoint at `/health`
- [x] Added MongoDB connection timeouts
- [x] Improved startup logging
- [x] Added graceful shutdown handler (SIGTERM)
- [x] Added detailed error logging with stack traces

### Environment Variables (TO DO)

Make sure ALL these environment variables are set in your deployment platform:

#### Required:
- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `JWT_ACCESS_SECRET_ADMIN` - Admin access token secret
- [ ] `JWT_REFRESH_SECRET_ADMIN` - Admin refresh token secret
- [ ] `JWT_ACCESS_SECRET_USER` - User access token secret
- [ ] `JWT_REFRESH_SECRET_USER` - User refresh token secret
- [ ] `NODE_ENV=production`

#### Optional (but recommended):
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `SHUFTIPRO_CLIENT_ID`
- [ ] `SHUFTIPRO_CLIENT_SECRET`
- [ ] `SHUFTIPRO_API_URL`
- [ ] `MAIL_USER`
- [ ] `MAIL_PASS`

**Note:** Do NOT set `PORT` manually - the platform will set it automatically!

### MongoDB Atlas Configuration

- [ ] **IP Whitelist:** Add `0.0.0.0/0` to allow connections from anywhere
  - Go to MongoDB Atlas → Network Access
  - Click "Add IP Address"
  - Select "Allow Access from Anywhere" or add `0.0.0.0/0`
  
- [ ] **Database User:** Verify credentials are correct
  - Username: `tekorasolution_db_user`
  - Password: Check it matches your connection string

- [ ] **Connection String:** Verify it's correct in your deployment platform

### Platform Configuration

#### For DigitalOcean App Platform:

1. **Build Command:**
   ```bash
   npm install
   ```

2. **Run Command:**
   ```bash
   npm start
   ```

3. **HTTP Port:**
   - Leave as default (8080) or blank for auto-detect

4. **Health Check:**
   - **Path:** `/health`
   - **Timeout:** 30 seconds
   - **Period:** 10 seconds
   - **Success Threshold:** 1
   - **Failure Threshold:** 3

5. **Instance Size:**
   - Basic: 512 MB RAM, 1 vCPU (minimum)
   - Recommended: 1 GB RAM, 1 vCPU

#### For Heroku:

1. **Create `Procfile`:**
   ```
   web: npm start
   ```

2. **Buildpack:**
   - Should auto-detect Node.js
   - Or manually add: `heroku/nodejs`

3. **Dyno Type:**
   - Basic or Eco (minimum)

#### For Render:

1. **Build Command:**
   ```bash
   npm install
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Health Check Path:**
   ```
   /health
   ```

## 🚀 Deployment Steps

### Step 1: Test Locally

```bash
# Install dependencies
npm install

# Start the server
npm start

# In another terminal, test the health endpoint
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2026-01-28T...",
#   "uptime": 1.234,
#   "environment": "development",
#   "message": "Server is healthy and running"
# }
```

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Fix deployment: Add health check, improve logging, bind to 0.0.0.0"
git push origin main
```

### Step 3: Deploy to Platform

- **DigitalOcean:** Push to connected repo or use doctl
- **Heroku:** `git push heroku main`
- **Render:** Push to connected repo

### Step 4: Monitor Deployment Logs

Watch the logs during deployment to see:

```
🔄 Starting server...
📍 PORT: 8080
📍 NODE_ENV: production
📍 MongoDB URI: Set ✅
🔄 Connecting to database...
✅ MongoDB Connected: cluster0-shard-00-00.auira3r.mongodb.net
✅ Database Name: test
🔄 Starting HTTP server...
🚀 Server running on port 8080
🌍 Environment: production
✅ Ready to accept connections
```

### Step 5: Test Deployed Application

```bash
# Test health endpoint
curl https://your-app-url.com/health

# Test root endpoint
curl https://your-app-url.com/

# Test with Postman
GET https://your-app-url.com/health
```

## 🔍 Troubleshooting

### If deployment still fails:

1. **Check application logs** - Look for the exact error message
2. **Verify MongoDB connection** - Test connection string locally
3. **Check environment variables** - Ensure all are set correctly
4. **Review MongoDB IP whitelist** - Must include `0.0.0.0/0`
5. **Check platform status** - Is there a platform outage?

### Common Error Messages:

**"MongoDB connection error"**
- ❌ IP not whitelisted
- ❌ Wrong credentials
- ✅ Add `0.0.0.0/0` to MongoDB Atlas Network Access

**"Port already in use"**
- ❌ Multiple instances running
- ✅ Platform should handle this automatically

**"Cannot find module"**
- ❌ Dependencies not installed
- ✅ Check build command is `npm install`

**"Timeout"**
- ❌ MongoDB connection taking too long
- ✅ Check MongoDB Atlas status and network access

## 📊 Post-Deployment Verification

### Test All Endpoints:

1. **Health Check:**
   ```bash
   curl https://your-app-url.com/health
   ```

2. **Root:**
   ```bash
   curl https://your-app-url.com/
   ```

3. **Admin Routes:**
   ```bash
   # Login
   POST https://your-app-url.com/admin/login
   ```

4. **User Routes:**
   ```bash
   # Login
   POST https://your-app-url.com/user/login
   ```

5. **Profile Routes:**
   ```bash
   # Get all profiles (requires auth)
   GET https://your-app-url.com/individual-profile
   ```

### Monitor Performance:

- [ ] Response time < 2 seconds
- [ ] Memory usage stable
- [ ] No error logs
- [ ] Health check returns 200 OK

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns 200 OK
- ✅ Application logs show "Ready to accept connections"
- ✅ No errors in deployment logs
- ✅ MongoDB connection successful
- ✅ All API endpoints responding
- ✅ Authentication working
- ✅ File uploads working (if applicable)

## 📞 Support

If you encounter issues:

1. Check `DEPLOYMENT_TROUBLESHOOTING.md` for detailed solutions
2. Review application logs for specific errors
3. Verify all checklist items are completed
4. Test locally first before redeploying

## 🔄 Quick Reference

**Health Check URL:**
```
https://your-app-url.com/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T07:46:50.000Z",
  "uptime": 123.456,
  "environment": "production",
  "message": "Server is healthy and running"
}
```

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**MongoDB IP Whitelist:**
```
0.0.0.0/0
```
