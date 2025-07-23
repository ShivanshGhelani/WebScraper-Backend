# 🚀 GitHub → Vercel Automatic Deployment Setup

## Method 1: Using Vercel Web Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Click "Login" and select "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### Step 2: Import Your Repository
1. Click "Add New..." → "Project"
2. Find your repository: `ShivanshGhelani/WebScraper-Backend`
3. Click "Import"

### Step 3: Configure Deployment Settings
```
Project Name: webscraper-backend
Framework Preset: Other
Root Directory: backend
Build Command: (leave empty for Python)
Output Directory: (leave empty for Python)
Install Command: pip install -r requirements.txt
```

### Step 4: Environment Variables (if needed)
Add any environment variables your app needs:
- `PYTHON_VERSION=3.9`

### Step 5: Deploy
Click "Deploy" - Vercel will automatically deploy your backend!

---

## Method 2: Using Vercel CLI (Alternative)

If you prefer command line:

```powershell
# Navigate to backend directory
cd backend

# Initialize project (use lowercase name)
vercel

# Follow prompts:
# - Project name: webscraper-backend
# - Directory: ./
# - Link to existing: No

# Deploy
vercel --prod
```

---

## 🎯 Result: Automatic Deployments

Once set up, **every push to GitHub main branch** will automatically:
1. ✅ Trigger a new Vercel deployment
2. ✅ Install Python dependencies
3. ✅ Deploy your FastAPI backend
4. ✅ Update your live API URL

## 🔄 Workflow After Setup

```bash
# Make changes to your code
# Commit and push to GitHub
git add .
git commit -m "Update backend feature"
git push origin main

# 🎉 Vercel automatically deploys the changes!
```

## 📋 Next Steps After Deployment

1. **Get your Vercel URL** (e.g., `https://webscraper-backend.vercel.app`)
2. **Update frontend/.env.electron**:
   ```
   VITE_API_URL=https://webscraper-backend.vercel.app
   ```
3. **Test the deployment** by visiting your Vercel URL
4. **Build your Electron app** with the new backend URL

## 🔧 Deployment Configuration

Your `vercel.json` is already configured for:
- ✅ Python runtime
- ✅ FastAPI serverless functions
- ✅ 300-second timeout
- ✅ Proper routing

## 🛠 Troubleshooting

**If deployment fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies in `requirements.txt`
- Ensure Python version compatibility

**If API calls fail:**
- Check CORS settings in your FastAPI app
- Verify Vercel URL is correct in frontend config
- Test API endpoints directly in browser
