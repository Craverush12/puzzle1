# 🚀 Deployment Guide: GitHub + Vercel

## Step 1: Prepare Your Project for GitHub

### 1.1 Create .gitignore file
First, let's create a proper .gitignore file to exclude sensitive files:

```bash
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/
build/

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### 1.2 Remove Test Component (Optional)
Before deploying to production, you might want to remove the test component.

## Step 2: GitHub Setup

### 2.1 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Repository name: `snb-puzzle-app` (or your preferred name)
4. Description: `SNB Puzzle Kiosk Application`
5. Make it **Public** (for free Vercel hosting)
6. **Don't** initialize with README (we already have files)
7. Click **"Create repository"**

### 2.2 Push Your Code to GitHub
Run these commands in your project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SNB Puzzle App with Supabase integration"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/snb-puzzle-app.git

# Push to GitHub
git push -u origin main
```

## Step 3: Vercel Deployment

### 3.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click **"New Project"**
4. Import your `snb-puzzle-app` repository
5. Click **"Import"**

### 3.2 Configure Project Settings
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 3.3 Add Environment Variables
In Vercel dashboard:
1. Go to your project
2. Click **"Settings"** tab
3. Click **"Environment Variables"**
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
```

5. Click **"Save"**

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Step 4: Production Optimizations

### 4.1 Remove Test Component (Optional)
For production, you might want to remove the test component:

```typescript
// In app/page.tsx, remove this line:
import SupabaseTest from '@/components/SupabaseTest';

// And remove this line from the return statement:
<SupabaseTest />
```

### 4.2 Update Metadata
Update your app metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'SNB Puzzle App',
  description: 'Interactive puzzle game for SNB kiosk',
  keywords: 'puzzle, game, kiosk, SNB',
};
```

## Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain
If you have a custom domain:
1. In Vercel dashboard, go to **"Domains"**
2. Add your domain
3. Update DNS records as instructed

### 5.2 Kiosk Configuration
For kiosk deployment:
1. Set up the kiosk to open your Vercel URL
2. Configure fullscreen mode
3. Disable browser navigation
4. Set up auto-refresh if needed

## Step 6: Monitoring & Updates

### 6.1 Automatic Deployments
- Every push to `main` branch will auto-deploy
- Preview deployments for pull requests

### 6.2 Monitoring
- Vercel provides built-in analytics
- Check deployment logs for errors
- Monitor Supabase usage

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check environment variables are set
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **Supabase Connection Issues**
   - Verify environment variables in Vercel
   - Check Supabase project is active
   - Verify RLS policies are correct

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check if all CSS files are included

## Security Considerations

### Environment Variables
- Never commit `.env.local` to GitHub
- Use Vercel's environment variable system
- Rotate Supabase keys if compromised

### Supabase Security
- RLS policies are already configured
- Public read/write access is intentional for kiosk use
- Monitor for unusual activity

## Performance Tips

1. **Image Optimization**
   - Use Next.js Image component
   - Optimize puzzle images
   - Consider WebP format

2. **Caching**
   - Vercel provides automatic caching
   - Supabase has built-in caching
   - Consider CDN for static assets

3. **Bundle Size**
   - Monitor bundle size
   - Remove unused dependencies
   - Use dynamic imports if needed

## Next Steps After Deployment

1. **Test the live version**
2. **Configure kiosk hardware**
3. **Set up monitoring**
4. **Create backup strategy**
5. **Document maintenance procedures**

Your SNB Puzzle App will be live and ready for kiosk deployment! 🎉
