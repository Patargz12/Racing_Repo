# Railway Deployment Guide for Toyota Hackathon Backend

## ✅ Pre-Deployment Checklist

All backend configuration is complete and ready for Railway deployment!

### What Was Configured:
- ✅ Railway configuration file (`railway.json`)
- ✅ Enhanced CORS for Vercel frontend
- ✅ Improved health check endpoint
- ✅ Environment variables documented
- ✅ Node.js 18+ compatibility

---

## 🚀 Deploy to Railway (Step-by-Step)

### Prerequisites
- GitHub/GitLab/Bitbucket account with your code pushed
- Railway account (sign up at https://railway.app)
- MongoDB Atlas URI ready
- Google Gemini API key ready

---

## Option A: Deploy via Railway Dashboard (Recommended)

### Step 1: Create Railway Account & Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub (recommended for automatic deployments)

### Step 2: Deploy from GitHub Repository

1. Click **"Deploy from GitHub repo"**
2. Select your repository
3. If you haven't connected GitHub yet:
   - Click **"Configure GitHub App"**
   - Grant Railway access to your repository

4. **Select the backend directory**:
   - Railway will detect your `backend` folder
   - If it doesn't auto-detect, you'll set the root directory in the next step

### Step 3: Configure Build Settings

Railway should auto-detect Node.js. Verify these settings:

- **Root Directory**: `/backend` (if your repo has both frontend and backend)
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `npm start` (auto-detected from package.json)
- **Watch Paths**: `/backend/**` (only redeploy when backend changes)

### Step 4: Add Environment Variables

This is **CRITICAL** - your backend won't work without these!

1. In your Railway project, click on the backend service
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"** for each:

```bash
MONGODB_URI
```
**Value**: Your MongoDB Atlas connection string
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

```bash
GEMINI_API_KEY
```
**Value**: Your Google Gemini API key
```
your_gemini_api_key_here
```

```bash
FRONTEND_URL
```
**Value**: Your Vercel frontend URL (you'll update this after frontend deployment)
```
https://your-app.vercel.app
```

**Note**: Railway automatically sets `PORT` and `NODE_ENV=production`, so you don't need to add those.

### Step 5: Deploy!

1. Click **"Deploy"** (or it may deploy automatically)
2. Wait 2-3 minutes for the build to complete
3. Watch the logs for any errors

### Step 6: Get Your Backend URL

1. Once deployed, go to the **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://your-backend.up.railway.app`

**Copy this URL!** You'll need it for your frontend configuration.

---

## Option B: Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This opens a browser for authentication.

### Step 3: Initialize Project

```bash
cd "d:\Programming\Toyota Hackathon\Project\backend"
railway init
```

Follow the prompts:
- **Project name**: `toyota-backend` (or your choice)
- **Environment**: `production`

### Step 4: Add Environment Variables

```bash
# Add MongoDB URI
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"

# Add Gemini API Key
railway variables set GEMINI_API_KEY="your_gemini_api_key_here"

# Add Frontend URL (your Vercel URL)
railway variables set FRONTEND_URL="https://your-app.vercel.app"
```

### Step 5: Deploy

```bash
railway up
```

This builds and deploys your backend to Railway.

### Step 6: Get Your URL

```bash
railway domain
```

Or generate one:

```bash
railway domain add
```

---

## 📋 Post-Deployment: Connect Frontend to Backend

### Step 1: Update Frontend Environment Variable

Now that your backend is deployed, update your Vercel frontend:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_API_URL`
4. Update it to your Railway backend URL:
   ```
   https://your-backend.up.railway.app/api
   ```
   **IMPORTANT**: Add `/api` at the end!
5. Click **Save**

### Step 2: Redeploy Frontend

After updating the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the three dots on the latest deployment
3. Select **"Redeploy"**

Or via CLI:
```bash
cd frontend
vercel --prod
```

### Step 3: Update Backend CORS (If Needed)

If you know your exact Vercel URL, you can add it to Railway:

```bash
railway variables set FRONTEND_URL="https://your-exact-vercel-url.vercel.app"
```

Railway will automatically redeploy with the new variable.

---

## ✅ Verify Your Deployment

### Test 1: Health Check

Open your browser or use curl:

```bash
curl https://your-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-23T...",
  "uptime": 123.45,
  "environment": "production",
  "mongodb": "connected",
  "collections": 13
}
```

### Test 2: Test from Frontend

1. Go to your Vercel frontend URL
2. Try asking a question in the chat
3. Check if the chatbot responds correctly

### Test 3: Check Railway Logs

In Railway dashboard:
1. Click on your backend service
2. Go to **"Logs"** tab
3. Look for:
   ```
   ✅ Express server is running on http://localhost:PORT
   📡 Upload API: http://localhost:PORT/api/upload
   💬 Chat API: http://localhost:PORT/api/chat
   🏥 Health check: http://localhost:PORT/api/health
   ```

---

## 🔧 Railway Configuration Details

### Automatic Features

Railway provides these automatically:

- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **Auto-scaling**: Scales based on load
- ✅ **Zero-downtime deploys**: Rolling deployments
- ✅ **Automatic restarts**: If your app crashes
- ✅ **Environment isolation**: Separate dev/prod environments
- ✅ **Metrics & Monitoring**: Built-in observability

### Resource Limits (Starter Plan)

- **Memory**: 512MB - 8GB (auto-scales)
- **CPU**: Shared, scales with memory
- **Builds**: Unlimited
- **Execution time**: No limit
- **Free tier**: $5 credit/month (enough for small projects)

---

## 🔄 Automatic Deployments

Railway automatically redeploys when you:

1. **Push to GitHub**: Any push to your main branch triggers a deployment
2. **Change environment variables**: Railway redeploys with new config
3. **Manual redeploy**: Click "Redeploy" in the Railway dashboard

### To Enable Auto-Deploy:

1. Go to **Settings** → **Service Settings**
2. Under **"Source"**, ensure your GitHub repo is connected
3. Set **"Watch Paths"** to `backend/**` (if monorepo)

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Railway's encrypted variable storage
- ✅ Rotate API keys regularly

### 2. MongoDB Security
- ✅ Use strong passwords
- ✅ Enable IP whitelist in MongoDB Atlas:
  - Add `0.0.0.0/0` to allow Railway (their IPs rotate)
  - Or use MongoDB Atlas VPC peering (paid feature)

### 3. CORS Configuration
Your backend is configured to accept:
- `localhost:3000` (local development)
- Your specific Vercel URL
- All `.vercel.app` preview deployments

To make it more strict, edit `server.js` and change `callback(null, true)` to `callback(new Error('Not allowed by CORS'))` in the else block.

### 4. Rate Limiting (Optional Enhancement)

Consider adding rate limiting for production:

```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring & Debugging

### View Logs

**Railway Dashboard**:
1. Go to your service
2. Click **"Logs"**
3. See real-time logs

**Railway CLI**:
```bash
railway logs
```

### Common Issues & Solutions

#### Issue: "MongoDB connection failed"

**Solution**:
1. Check `MONGODB_URI` is correct in Railway variables
2. Verify MongoDB Atlas allows connections from `0.0.0.0/0`
3. Check MongoDB Atlas user has correct permissions

#### Issue: "CORS error in frontend"

**Solution**:
1. Verify `FRONTEND_URL` is set in Railway
2. Check frontend is using correct backend URL
3. Look at browser console for exact CORS error
4. Verify Railway backend logs show the request

#### Issue: "404 on API endpoints"

**Solution**:
1. Make sure you're calling `https://backend.railway.app/api/chat` (with `/api`)
2. Check Railway logs to see if requests are reaching the server
3. Verify routes are loaded correctly in server startup logs

#### Issue: "Build failed"

**Solution**:
1. Check Railway build logs for specific error
2. Verify `package.json` has all dependencies
3. Ensure Node.js version compatibility (18+)
4. Try rebuilding: Settings → Redeploy

---

## 💰 Cost Estimates

### Railway Pricing

**Starter Plan** (recommended for development):
- **$5/month** free credit
- **$0.000463/GB-hour** for memory usage
- **$0.000231/vCPU-hour** for CPU

**Typical Backend Costs**:
- Small app (512MB, low traffic): ~$1-3/month
- Medium app (1GB, moderate traffic): ~$5-10/month
- Your $5 free credit covers small projects entirely!

**Pro Plan** ($20/month):
- Priority support
- More concurrent builds
- Advanced metrics

---

## 🚀 Advanced Features

### Custom Domain

1. In Railway, go to **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. Railway handles SSL automatically

### Multiple Environments

Create separate Railway projects for:
- **Development**: `dev` branch → dev.railway.app
- **Staging**: `staging` branch → staging.railway.app
- **Production**: `main` branch → prod.railway.app

### Database Backups

Railway doesn't host your MongoDB, so backups are handled by MongoDB Atlas:

1. In MongoDB Atlas, go to your cluster
2. Click **"Backup"** tab
3. Enable **"Cloud Backup"**
4. Set retention policy

---

## 🔄 Updating Your Backend

### Push Updates via Git

```bash
# Make your changes
git add .
git commit -m "Update backend API"
git push origin main
```

Railway automatically detects and deploys!

### Via Railway CLI

```bash
cd backend
railway up
```

### Rollback Deployment

If something breaks:

1. Go to **Deployments** in Railway dashboard
2. Find a working deployment
3. Click **"Rollback"**

---

## 📞 Troubleshooting Checklist

Before asking for help, verify:

- [ ] Railway deployment succeeded (check build logs)
- [ ] All environment variables are set correctly
- [ ] Health check endpoint returns 200 OK
- [ ] MongoDB connection works (check health endpoint response)
- [ ] Frontend has correct backend URL in `NEXT_PUBLIC_API_URL`
- [ ] CORS is configured for your frontend domain
- [ ] Railway domain is generated and accessible
- [ ] No errors in Railway logs

---

## 📚 Useful Railway Commands

```bash
# Login
railway login

# Link to existing project
railway link

# View environment variables
railway variables

# View logs
railway logs

# Open Railway dashboard
railway open

# Run command in Railway environment
railway run node scripts/backfill-registry.js

# Check status
railway status
```

---

## 🎯 Complete Deployment Workflow

Here's the full workflow from start to finish:

### 1. Deploy Backend to Railway
- Push code to GitHub
- Create Railway project
- Connect GitHub repo
- Add environment variables (MONGODB_URI, GEMINI_API_KEY)
- Deploy and get backend URL

### 2. Update Frontend on Vercel
- Update `NEXT_PUBLIC_API_URL` with Railway backend URL
- Redeploy frontend

### 3. Update Backend CORS
- Add frontend Vercel URL to `FRONTEND_URL` in Railway
- Railway auto-redeploys

### 4. Test Everything
- Health check endpoint
- Chat functionality
- File upload
- Admin panel

### 5. Monitor
- Check Railway logs
- Monitor MongoDB Atlas
- Test from different devices

---

## ✨ Your Backend is Ready!

After following this guide:

- ✅ Backend deployed on Railway
- ✅ Frontend connected to backend
- ✅ CORS configured correctly
- ✅ MongoDB connected
- ✅ AI chatbot working
- ✅ Automatic deployments enabled

**Next Steps**:
1. Deploy your backend following Option A or B above
2. Copy your Railway backend URL
3. Update your Vercel frontend with the new URL
4. Test everything works together!

---

## 📖 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Need Help?**
- Railway Discord: https://discord.gg/railway
- Railway Twitter: @Railway

**Backend Version**: 1.0.0  
**Last Updated**: November 2024

