# 🚀 Vercel Deployment Guide - Astrovaani Admin Dashboard

## ✅ **Quick Deployment to Vercel (For Testing)**

### **Method 1: Deploy via Vercel CLI (Fastest)**

#### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

#### **Step 2: Login to Vercel**

```bash
vercel login
```

This will open your browser - login with GitHub, GitLab, or email.

#### **Step 3: Deploy from Build Folder**

```bash
cd e:\Astrovaani\astrovaani_web_fe
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name?** `astrovaani-admin` (or any name)
- **Directory?** `./build`
- **Want to override settings?** N

**Done!** You'll get a URL like: `https://astrovaani-admin.vercel.app`

---

### **Method 2: Deploy via Vercel Website (Easier)**

#### **Step 1: Go to Vercel**

Visit: https://vercel.com/

#### **Step 2: Sign Up / Login**

- Login with GitHub (recommended)
- Or use email

#### **Step 3: Import Project**

1. Click **"Add New..."** → **"Project"**
2. Click **"Browse"** or **"Upload"**
3. Select the `build` folder: `e:\Astrovaani\astrovaani_web_fe\build`

#### **Step 4: Configure**

- **Project Name:** `astrovaani-admin`
- **Framework Preset:** Other (or Create React App)
- **Root Directory:** `./` (since we're uploading build directly)
- **Build Command:** (leave empty - already built)
- **Output Directory:** `./` (already built)

#### **Step 5: Deploy**

Click **"Deploy"**

Wait 30-60 seconds...

**Done!** You'll get a URL like: `https://astrovaani-admin.vercel.app`

---

## 🔧 **Configure Environment Variables**

Your React app uses `REACT_APP_API_URL`. Let's configure it:

### **In Vercel Dashboard:**

1. Go to your project
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://astrovaani-be.onrender.com/api`
   - **Environment:** Production, Preview, Development (all selected)
5. Click **"Save"**

### **Redeploy After Adding Variables:**

```bash
vercel --prod
```

Or in Vercel Dashboard:
- Go to **"Deployments"**
- Click **"..."** on latest deployment → **"Redeploy"**

---

## 📋 **Vercel Configuration File**

The `vercel.json` is already in your project root. Here's what it does:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This handles React Router - all routes go to `index.html`.

---

## ✅ **What Works on Vercel**

- ✅ Automatic HTTPS
- ✅ Free custom domain
- ✅ React Router (all routes work)
- ✅ Environment variables
- ✅ Instant deployments
- ✅ Preview deployments for testing
- ✅ No server configuration needed

---

## 🌐 **Expected URLs**

After deployment:
- **Production:** https://astrovaani-admin.vercel.app
- **Login:** https://astrovaani-admin.vercel.app/admin/login
- **Vendors:** https://astrovaani-admin.vercel.app/admin/vendors
- **Schedule:** https://astrovaani-admin.vercel.app/admin/schedule

---

## 🔄 **Update Deployment (After Changes)**

### **Method 1: Via CLI**

```bash
npm run build
vercel --prod
```

### **Method 2: Via GitHub**

1. Push code to GitHub
2. Connect Vercel to GitHub repo
3. Auto-deploys on every push

---

## ⚡ **Quick Commands**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# Remove deployment
vercel remove astrovaani-admin
```

---

## 🎯 **Deployment Status**

```
Build Status: ✅ Complete
Build Location: e:\Astrovaani\astrovaani_web_fe\build\
Vercel Account: (to be created)
Deployment URL: (will be generated)
```

---

## 📊 **Vercel vs VPS Comparison**

| Feature | Vercel | VPS (Hostinger) |
|---------|--------|-----------------|
| Setup Time | 2 minutes | 30+ minutes |
| Configuration | Zero | Complex |
| HTTPS | Automatic | Manual/Let's Encrypt |
| Routing | Automatic | Manual config |
| Cost (Testing) | Free | Already paid |
| Custom Domain | Free | Included |
| Best For | Testing & Staging | Production |

---

## 🚀 **Recommendation**

**For Right Now (Testing):**
- ✅ Deploy to Vercel
- ✅ Test all features
- ✅ Share with team for testing
- ✅ Complete WhatsApp integration testing

**For Production (Later):**
- ⏳ Create subdomain on VPS: `admin.astrovaani.com`
- ⏳ Deploy to subdomain
- ⏳ Point DNS
- ⏳ Go live

---

**Ready to deploy? Run this command:**

```bash
npm install -g vercel && vercel login && vercel --prod
```

This will:
1. Install Vercel CLI
2. Login (opens browser)
3. Deploy your app
4. Give you a live URL in 2 minutes!

---

**Document Created:** November 16, 2025  
**Purpose:** Quick testing deployment while VPS is being configured  
**Next Step:** Run the deployment command above!
