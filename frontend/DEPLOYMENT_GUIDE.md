# Vercel Deployment Guide for Toyota Hackathon Frontend

## ✅ Configuration Complete!

All necessary configuration changes have been implemented. Your frontend is now ready for Vercel deployment.

## What Was Changed

### 1. Fixed Hardcoded URLs
- **`src/app/explain/page.tsx`**: Now uses `API_URL` environment variable
- **`src/app/components/admin/useDatabaseUpload.ts`**: Now uses `API_URL` environment variable

### 2. Environment Files Created
- **`.env.local`**: Local development configuration (not committed to Git)
- **`.env.example`**: Template file for environment variables (committed to Git)

### 3. Vercel Configuration
- **`vercel.json`**: Added with security headers and deployment settings

### 4. Build Verification
✅ Production build tested successfully - all pages compiled without errors

---

## Deployment Options

### Option A: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Prepare Your Repository
```bash
# Ensure you're in the project root
cd "d:\Programming\Toyota Hackathon\Project"

# Add and commit the changes
git add frontend/
git commit -m "Configure frontend for Vercel deployment"

# Push to GitHub/GitLab/Bitbucket
git push origin main
```

#### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository

#### Step 3: Configure Project Settings
In the import configuration screen:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `frontend` ⚠️ **IMPORTANT**: Set this to `frontend` since your Next.js app is in a subdirectory
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

#### Step 4: Add Environment Variable
Before deploying, add the environment variable:

- Click on **"Environment Variables"**
- Add:
  - **Key**: `NEXT_PUBLIC_API_URL`
  - **Value**: `https://placeholder.com/api` (temporary - you'll update this after backend deployment)
  - **Environment**: All (Production, Preview, Development)

#### Step 5: Deploy
- Click **"Deploy"**
- Wait 2-5 minutes for the build to complete
- You'll receive a URL like `https://your-app.vercel.app`

---

### Option B: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Navigate to Frontend Directory
```bash
cd "d:\Programming\Toyota Hackathon\Project\frontend"
```

#### Step 3: Login to Vercel
```bash
vercel login
```
Follow the browser authentication process.

#### Step 4: Deploy to Preview
```bash
vercel
```

When prompted:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) or Yes (if project exists)
- **Project name?** Enter a name (e.g., `toyota-chatbot`)
- **In which directory is your code located?** `./` (current directory)

This creates a preview deployment URL.

#### Step 5: Add Environment Variables
```bash
vercel env add NEXT_PUBLIC_API_URL
```

When prompted:
- **Value**: `https://placeholder.com/api` (temporary)
- **Environment**: Select **Production** (use spacebar to select, enter to confirm)

#### Step 6: Deploy to Production
```bash
vercel --prod
```

This deploys to your production URL.

---

## Post-Deployment Steps

### After Backend Deployment

Once you deploy your backend, you need to update the API URL:

#### Via Vercel Dashboard:
1. Go to your project dashboard on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Find `NEXT_PUBLIC_API_URL`
4. Click **Edit**
5. Update the value to your actual backend URL (e.g., `https://your-backend.railway.app/api`)
6. Click **Save**
7. Go to **Deployments** tab
8. Click the three dots on the latest deployment
9. Select **Redeploy**

#### Via Vercel CLI:
```bash
# Remove old environment variable
vercel env rm NEXT_PUBLIC_API_URL production

# Add new environment variable with actual backend URL
vercel env add NEXT_PUBLIC_API_URL
# Enter your actual backend URL when prompted
# Select "Production" environment

# Redeploy
vercel --prod
```

---

## Important Backend Configuration

⚠️ **Your backend will need CORS configuration** to accept requests from your Vercel domain.

Add this to your backend's Express app:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

Replace `your-app.vercel.app` with your actual Vercel URL.

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add**
4. Enter your domain name
5. Follow the DNS configuration instructions provided by Vercel

---

## Automatic Deployments

✅ **Every push to your main branch will automatically deploy to production**

✅ **Every pull request will get its own preview URL**

This means your frontend will always be up to date with your latest code!

---

## Troubleshooting

### Build Fails on Vercel
- Check the build logs in the Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify your Node.js version is compatible (Next.js 16 requires Node.js 18.17+)

### API Calls Not Working
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that your backend allows CORS from your Vercel domain
- Use browser DevTools Network tab to see the actual API URL being called

### Environment Variables Not Updating
- After changing environment variables, you must **redeploy** for changes to take effect
- Remember: only variables starting with `NEXT_PUBLIC_` are available in the browser

---

## Next Steps

1. ✅ Deploy your frontend to Vercel (using Option A or B above)
2. ⏳ Deploy your backend (we can help with this next!)
3. ⏳ Update `NEXT_PUBLIC_API_URL` with actual backend URL
4. ⏳ Configure CORS on backend
5. ⏳ Test the integration

---

## Useful Vercel CLI Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# View environment variables
vercel env ls

# Pull environment variables to local
vercel env pull

# Remove a deployment
vercel rm <deployment-url>
```

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Your frontend is now ready for deployment! Choose either Option A (Dashboard) or Option B (CLI) and follow the steps above.**

