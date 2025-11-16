# 🚀 Frontend Deployment - VPS/CyberPanel Step by Step Guide

## ✅ Build Status: READY FOR DEPLOYMENT

Build completed successfully on: November 16, 2025
Build folder: `build/` (ready to deploy)

---

## 📦 **VPS/CYBERPANEL DEPLOYMENT - Follow These Exact Steps**

### **🎯 What You're Deploying:**
- Frontend (React Admin Panel) → VPS CyberPanel
- Backend (Node.js API) → Already running on Render ✅
- Database (MongoDB) → Already configured ✅

**Your VPS Details (from image):**
- Server: `srv647571.hstgr.cloud`
- IP: `82.112.236.1`
- Status: ✅ Running
- Root access: `ssh root@82.112.236.1`

---

### **Step 1: Access CyberPanel**

1. From Hostinger VPS page, click **"Manage panel"** button (purple button)
2. OR directly visit: **https://82.112.236.1:8090** (or your VPS IP with port 8090)
3. Login with your CyberPanel credentials:
   - Username: `admin`
   - Password: (check Hostinger VPS overview for password or click "Reset")

---

### **Step 2: Create/Select Website in CyberPanel**

1. After login, go to: **Websites** → **List Websites**
2. If `astrovaani.com` exists:
   - Click on it to manage
3. If NOT exist, create it:
   - Go to: **Websites** → **Create Website**
   - Domain: `astrovaani.com`
   - Email: Your email
   - Package: Select any
   - Click **"Create Website"**

---

### **Step 3: Access File Manager**

1. In CyberPanel, go to: **File Manager**
2. Navigate to your website folder:
   - Path: `/home/astrovaani.com/public_html/`
   - (Replace `astrovaani.com` with your actual domain)
3. This is where you'll upload files

---

### **Step 4: Upload Build Files via SFTP (EASIEST METHOD)**

**Option A: Using FileZilla (Recommended)**

1. **Download FileZilla** (if not installed): https://filezilla-project.org/

2. **Get Root Password:**
   - In Hostinger VPS dashboard, under "Root password" section
   - Click the **"Change"** button
   - Set a new password (write it down!)
   - Confirm the new password
   - Save it somewhere safe

3. **Open FileZilla** and connect:
   - Host: `82.112.236.1` (your VPS IP)
   - Username: `root`
   - Password: (the password you just set in step 2)
   - Port: `22`
   - Click **"Quickconnect"**

3. **Navigate to website folder:**
   - On the right panel (Remote site), navigate to:
   - `/home/astrovaani.com/public_html/`
   - (Or `/home/YOUR_DOMAIN/public_html/`)

4. **Create admin folder:**
   - Right-click in the remote panel → **"Create directory"**
   - Name: `admin`
   - Double-click to open it

5. **Upload files:**
   - On the left panel (Local site), navigate to:
   - `e:\Astrovaani\astrovaani_web_fe\build\`
   - Select **ALL files and folders** inside `build`
   - Drag and drop to the right panel (Remote site)
   - Wait for transfer to complete (~2 minutes)

**Option B: Using CyberPanel File Manager**

1. In CyberPanel, go to: **File Manager**
2. Navigate to: `/home/astrovaani.com/public_html/`
3. Create folder: `admin`
4. Click on `admin` folder
5. Click **"Upload"** button
6. Select all files from: `e:\Astrovaani\astrovaani_web_fe\build\`
7. Wait for upload (may be slow for many files)

---

### **Step 5: Create .htaccess File**

1. In CyberPanel File Manager (or FileZilla):
2. Navigate to: `/home/astrovaani.com/public_html/admin/`
3. Create a new file named: `.htaccess`
4. Edit the file and paste this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /admin/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /admin/index.html [L]
</IfModule>

Options -Indexes
```

5. **Save** the file
6. Set permissions (if using FileZilla):
   - Right-click `.htaccess` → **"File permissions"**
   - Set to: `644`

---

### **Step 6: Configure Domain (If Not Already Done)**

1. In CyberPanel, go to: **DNS** → **Create/Delete DNS Zone**
2. Select your domain: `astrovaani.com`
3. Verify A record points to: `82.112.236.1`
4. If using Cloudflare or other DNS, update:
   - A record: `@` → `82.112.236.1`
   - A record: `www` → `82.112.236.1`

---

### **Step 7: Set File Permissions (Important!)**

**Via SSH (Recommended):**

1. Open Command Prompt or PowerShell
2. Connect to VPS:
   ```bash
   ssh root@82.112.236.1
   ```
3. Enter root password when prompted
4. Run these commands:
   ```bash
   cd /home/astrovaani.com/public_html/admin
   chown -R astrovaani:astrovaani .
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   ```
5. Type `exit` to close SSH

**Via CyberPanel:**
- File Manager → Select all files → Set permissions to `644`
- Folders → Set permissions to `755`

---

### **Step 8: Verify Upload**

Your `/home/astrovaani.com/public_html/admin/` folder should now contain:

```
admin/
├── index.html
├── asset-manifest.json
├── favicon.ico
├── manifest.json
├── robots.txt
├── .htaccess  ← Important!
└── static/
    ├── css/
    ├── js/
    └── media/
```

---

### **Step 9: Test Your Deployment**

1. Open a new browser tab
2. Visit: **http://82.112.236.1/admin/** (using IP first)
3. Or visit: **https://astrovaani.com/admin/** (if domain configured)
4. You should see the admin login page

**Expected Result:** ✅ Login page loads, no errors

---

### **Step 10: Test Interview Scheduling (Main Feature)**

1. After login, navigate to: **Vendors** → **Interviews**
2. Click **"Schedule"** on any pending vendor
3. Add a time slot (date + time)
4. Click **"Save slots"**
5. Click **"🔔 Notify Vendor"** button
6. Check browser console (F12) for any errors

**Expected Result:** ✅ Slots save successfully, notification API call works

---

## 🎉 **DEPLOYMENT COMPLETE!**

### **Your URLs:**
- ✅ **Admin Panel:** https://astrovaani.com/admin/
- ✅ **Interview Page:** https://astrovaani.com/interview?code=XXX
- ✅ **Backend API:** https://astrovaani-be.onrender.com/api

### **What's Working:**
- ✅ Admin dashboard
- ✅ Vendor management
- ✅ Interview scheduling
- ✅ API calls to Render backend
- ✅ Database operations

### **What's Pending:**
- ⏳ WhatsApp template creation (IconicSolution dashboard)
- ⏳ WhatsApp approval (24-48 hours after creation)

---

## 🔧 **Troubleshooting**

### **Issue 1: Blank page or "Cannot GET /admin/"**
**Solution:**
- Check if `.htaccess` file exists
- Verify `.htaccess` content is correct
- Clear browser cache (Ctrl + Shift + Delete)

### **Issue 2: 404 on page refresh**
**Solution:**
- `.htaccess` not uploaded or incorrect
- Re-upload `.htaccess` with correct `RewriteBase /admin/`

### **Issue 3: API calls failing**
**Solution:**
- Check if Render backend is running: https://astrovaani-be.onrender.com/api
- Verify `.env` has: `REACT_APP_API_URL=https://astrovaani-be.onrender.com/api`
- Check browser console (F12) for CORS errors

### **Issue 4: WhatsApp notifications not working**
**Solution:**
- Templates need to be created in IconicSolution
- See: `COMPLETE_TEMPLATES_WITH_BUTTONS.md` for template details
- Wait 24-48 hours for WhatsApp approval

---

## 📞 **Quick Help**

**Files in wrong location?**
- Move them to: `public_html/admin/`

**Can't find .htaccess?**
- Enable "Show hidden files" in File Manager settings

**Still having issues?**
1. Check browser console (F12) → Console tab
2. Check Network tab → Look for red errors
3. Verify all files uploaded completely

---

## ⚡ **THAT'S IT! You're Done!**

**Total Time:** ~10 minutes
**Difficulty:** ⭐ Easy (just drag & drop files)

---

## � **Deployment Checklist**

```
✅ Build completed (npm run build)
✅ .env configured with production API
⬜ Login to Hostinger File Manager
⬜ Create /admin folder in public_html
⬜ Upload ALL files from build/ folder
⬜ Create .htaccess file
⬜ Test login at https://astrovaani.com/admin/
⬜ Test interview scheduling
⬜ Create WhatsApp templates in IconicSolution
```

---

## � **Architecture Overview**

```
User Browser
    ↓
https://astrovaani.com/admin/ (Hostinger - Static Files)
    ↓ API Calls
https://astrovaani-be.onrender.com/api (Render - Node.js Backend)
    ↓ Database
MongoDB Atlas (Cloud Database)
    ↓ WhatsApp
IconicSolution WhatsApp API
```

**All components are already configured and working!**
