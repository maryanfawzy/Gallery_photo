# 🚀 Vercel Deployment Guide

## Quick Deploy (Easiest Method)

### Option 1: Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Navigate to your project folder
cd vercel-gallery

# 3. Deploy
vercel

# 4. Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? vercel-gallery
# - In which directory is your code located? ./
# - Want to override the settings? N
```

### Option 2: GitHub Integration

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit"

# 4. Create repository on GitHub
# 5. Add remote origin
git remote add origin https://github.com/yourusername/vercel-gallery.git

# 6. Push to GitHub
git push -u origin main

# 7. Go to vercel.com
# 8. Click "New Project"
# 9. Import from GitHub
# 10. Select your repository
# 11. Click "Deploy"
```

## Manual Configuration (If Needed)

If Vercel doesn't auto-detect settings:

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`
**Node.js Version:** 18.x

## Environment Variables

If you need environment variables:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add variables as needed

## Custom Domain

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting Common Issues

### Build Fails

**Error: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "TypeScript compilation failed"**
- Check `tsconfig.json` configuration
- Ensure all TypeScript files have proper types
- Run `npm run build` locally to test

### Deployment Issues

**Error: "No output directory"**
- Ensure `dist` folder is created during build
- Check `vite.config.ts` output directory setting

**Error: "Function timeout"**
- Large dependencies might cause timeout
- Consider code splitting in `vite.config.ts`

### Runtime Issues

**Blank page after deployment**
- Check browser console for errors
- Ensure all assets are loading correctly
- Verify routing configuration

**Images not loading**
- Check image paths are relative
- Ensure images are in `public` folder or imported correctly

## Performance Optimization

### Code Splitting
Already configured in `vite.config.ts`:
```typescript
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['react', 'react-dom'],
      ui: ['@radix-ui/react-dialog'],
      motion: ['framer-motion'],
      icons: ['lucide-react']
    }
  }
}
```

### Image Optimization
- Use WebP format when possible
- Implement lazy loading (already included)
- Consider image compression

## Monitoring

1. **Analytics:** Enable Vercel Analytics in project settings
2. **Speed Insights:** Enable Web Vitals monitoring
3. **Logs:** Check Function Logs for any runtime errors

## Updates

To update your deployment:

```bash
# Method 1: If using CLI
vercel --prod

# Method 2: If using GitHub
git add .
git commit -m "Update"
git push origin main
# Vercel will auto-deploy
```

---

**Your gallery is now live! 🎉**

