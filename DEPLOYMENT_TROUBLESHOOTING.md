# Deployment Troubleshooting - 503 Service Unavailable

## 🔴 Error: 503 Service Unavailable

**Error Message:**
```
upstream_reset_before_response_started{connection_termination} (503 UC)
App Platform failed to forward this request to the application.
```

## 🔍 Root Causes

This error occurs when the deployment platform (DigitalOcean App Platform, Heroku, Render, etc.) cannot connect to your application. Common causes:

### 1. **Port Binding Issue** ⚠️ (Most Common)
Your app must listen on the PORT environment variable provided by the platform.

**Current Configuration:**
```javascript
const PORT = process.env.PORT || 3000;
```

**✅ This is correct!** But make sure:
- Your platform sets the `PORT` environment variable
- Your app binds to `0.0.0.0` not `localhost`

### 2. **Application Startup Failure**
The app crashes during startup before it can accept connections.

### 3. **Database Connection Timeout**
MongoDB connection takes too long or fails.

### 4. **Missing Environment Variables**
Required env vars are not set in the deployment platform.

### 5. **Health Check Failure**
Platform's health check endpoint is not responding.

## ✅ Solutions

### Solution 1: Ensure Proper Port Binding

**Current code (server.js):**
```javascript
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Better for deployment:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

This ensures the app binds to all network interfaces, not just localhost.

### Solution 2: Add Health Check Endpoint

Add a simple health check endpoint that the platform can ping:

**In `src/app.js`:**
```javascript
// Health check endpoint (add before other routes)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Solution 3: Improve Database Connection Handling

**In `src/config/db.js`:**
```javascript
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error; // Re-throw to be caught by server.js
  }
};
```

### Solution 4: Add Startup Logging

Improve logging to see exactly where the app fails:

**In `server.js`:**
```javascript
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('📍 PORT:', PORT);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');
    
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    console.log('🔄 Starting HTTP server...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};
```

### Solution 5: Check Platform Configuration

#### For DigitalOcean App Platform:

1. **Check Build Command:**
   ```bash
   npm install
   ```

2. **Check Run Command:**
   ```bash
   npm start
   ```

3. **Check Environment Variables:**
   - `PORT` - Usually auto-set by platform
   - `MONGODB_URI` - Must be set manually
   - `NODE_ENV=production`
   - All JWT secrets
   - Cloudinary credentials
   - Shufti Pro credentials

4. **Check HTTP Port:**
   - Should be set to `8080` or leave blank (auto-detect)

5. **Check Health Check:**
   - Path: `/health` or `/`
   - Timeout: 30 seconds
   - Period: 10 seconds

#### For Heroku:

1. **Procfile:**
   ```
   web: npm start
   ```

2. **Port:**
   - Heroku sets `PORT` automatically
   - Don't hardcode port 3000

#### For Render:

1. **Build Command:**
   ```bash
   npm install
   ```

2. **Start Command:**
   ```bash
   npm start
   ```

3. **Port:**
   - Render sets `PORT` to 10000 by default

## 🔧 Debugging Steps

### Step 1: Check Application Logs

**On DigitalOcean App Platform:**
1. Go to your app dashboard
2. Click on "Runtime Logs"
3. Look for error messages during startup

**Common errors to look for:**
```
❌ MongoDB connection error
❌ UNCAUGHT EXCEPTION
❌ UNHANDLED PROMISE REJECTION
❌ Error: listen EADDRINUSE
```

### Step 2: Verify Environment Variables

Make sure ALL required environment variables are set in the platform:

**Required:**
- ✅ `MONGODB_URI`
- ✅ `JWT_ACCESS_SECRET_ADMIN`
- ✅ `JWT_REFRESH_SECRET_ADMIN`
- ✅ `JWT_ACCESS_SECRET_USER`
- ✅ `JWT_REFRESH_SECRET_USER`
- ✅ `NODE_ENV=production`

**Optional (but recommended):**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SHUFTIPRO_CLIENT_ID`
- `SHUFTIPRO_CLIENT_SECRET`
- `SHUFTIPRO_API_URL`
- `MAIL_USER`
- `MAIL_PASS`

### Step 3: Test Locally First

Before deploying, test in production mode locally:

```bash
# Set environment to production
export NODE_ENV=production

# Start the server
npm start

# Test the health endpoint
curl http://localhost:3000/health
```

### Step 4: Check MongoDB Connection

Verify your MongoDB URI is correct and accessible:

```bash
# Test connection using mongosh
mongosh "mongodb+srv://tekorasolution_db_user:wzaMXOfCZ6jhm7HN@cluster0.auira3r.mongodb.net/"
```

**Common MongoDB issues:**
- ❌ IP not whitelisted (add `0.0.0.0/0` for all IPs)
- ❌ Wrong credentials
- ❌ Network timeout

### Step 5: Simplify Startup

Temporarily disable external API calls to isolate the issue:

**In `.env` (deployment platform):**
```bash
# Comment out or remove Shufti Pro credentials
# This will make the API skip external calls
```

## 🚀 Quick Fix Checklist

- [ ] Server binds to `0.0.0.0` not `localhost`
- [ ] `PORT` environment variable is used (not hardcoded)
- [ ] Health check endpoint exists (`/health`)
- [ ] All required environment variables are set
- [ ] MongoDB URI is correct and accessible
- [ ] MongoDB IP whitelist includes deployment platform IPs
- [ ] Build command is `npm install`
- [ ] Start command is `npm start`
- [ ] Application logs show successful startup
- [ ] No uncaught exceptions during startup

## 📋 Recommended Changes

### 1. Update `server.js`:

```javascript
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('📍 PORT:', PORT);
    console.log('📍 NODE_ENV:', process.env.NODE_ENV);
    
    await connectDB();
    console.log('✅ Database connected');

    // Bind to 0.0.0.0 for deployment platforms
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`✅ Ready to accept connections`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};
```

### 2. Add Health Check in `src/app.js`:

```javascript
// Add this BEFORE your other routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### 3. Update MongoDB Connection Timeout:

In `src/config/db.js`, add timeout options:

```javascript
const conn = await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});
```

## 🔄 Deployment Workflow

1. **Make the recommended changes above**
2. **Test locally:**
   ```bash
   npm start
   curl http://localhost:3000/health
   ```
3. **Commit and push changes**
4. **Redeploy on platform**
5. **Check logs immediately after deployment**
6. **Test health endpoint:**
   ```bash
   curl https://your-app-url.com/health
   ```

## 📞 If Issue Persists

1. **Share the application logs** - Look for the exact error message
2. **Check platform status** - Is there a platform outage?
3. **Verify MongoDB Atlas status** - Is the database accessible?
4. **Try a minimal deployment** - Deploy with just the health endpoint
5. **Contact platform support** - With logs and error details

## 🎯 Most Likely Solution

Based on the 503 error, the most likely issue is:

1. **MongoDB connection timeout** - Add IP `0.0.0.0/0` to MongoDB Atlas whitelist
2. **Missing environment variables** - Double-check all env vars are set
3. **Port binding issue** - Ensure binding to `0.0.0.0`

Try these three fixes first!
