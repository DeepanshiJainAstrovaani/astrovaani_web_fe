# 🚀 Complete VPS Deployment Guide - Astrovaani Admin Dashboard

## 📋 **Server Information**

### **VPS Details:**
- **Provider:** Hostinger VPS
- **Server:** srv647571.hstgr.cloud
- **IP Address:** 82.112.236.1
- **Web Server:** OpenLiteSpeed (lsws)
- **OS:** AlmaLinux 9

### **Access Credentials:**
- **SSH:** `ssh root@82.112.236.1`
- **Root Password:** `Astrovaani123@`
- **CyberPanel URL:** https://82.112.236.1:8090
- **CyberPanel Username:** admin

### **Domain:**
- **Main Domain:** astrovaani.com
- **Current Status:** PHP website running on root
- **SSL:** Let's Encrypt (configured)

---

## 📂 **Current Server Structure**

```
/home/astrovaani.com/
├── public_html/                    ← Main website root
│   ├── admindashboard/            ← React admin app (uploaded but not configured)
│   │   ├── index.html
│   │   ├── static/
│   │   ├── .htaccess
│   │   └── ... (all React build files)
│   ├── api/                       ← Existing PHP API
│   ├── assets/
│   ├── blog/
│   ├── chat/
│   ├── community/
│   ├── css/
│   ├── font/
│   ├── horoscope/
│   ├── icons/
│   └── images/
```

---

## ✅ **What We Completed**

### **1. SSH Connection Setup**
- Connected to VPS via SSH
- Root password set: `Astrovaani123@`
- Verified server status and file structure

### **2. FileZilla SFTP Upload**
- Downloaded and installed FileZilla Client
- Connected via SFTP:
  - Host: `82.112.236.1`
  - Username: `root`
  - Password: `Astrovaani123@`
  - Port: `22`

### **3. Files Uploaded to VPS**
- **Location:** `/home/astrovaani.com/public_html/admindashboard/`
- **Source:** `e:\Astrovaani\astrovaani_web_fe\build\`
- **Files Uploaded:**
  - index.html
  - asset-manifest.json
  - favicon.ico
  - logo192.png
  - logo512.png
  - manifest.json
  - robots.txt
  - .htaccess
  - static/ folder (css, js, media)
- **Total Size:** 23,636 bytes

### **4. OpenLiteSpeed Configuration Attempted**
- **Config File:** `/usr/local/lsws/conf/vhosts/astrovaani.com/vhost.conf`
- **Configuration Added:**
```
context /admindashboard {
  location /home/astrovaani.com/public_html/admindashboard
  allowBrowse 1
  
  rewrite {
    enable 1
    autoLoadHtaccess 1
  }
}
```
- **Status:** Configuration saved but routing still not working
- **Issue:** OpenLiteSpeed requires additional configuration or CyberPanel access

---

## 🔧 **SSH Commands Used**

### **Connect to VPS:**
```bash
ssh root@82.112.236.1
# Password: Astrovaani123@
```

### **Navigate and Explore:**
```bash
# List Nginx/OpenLiteSpeed configs
ls -la /etc/nginx/sites-available/
ls -la /usr/local/lsws/conf/vhosts/

# Check website files
ls -la /home/astrovaani.com/public_html/
ls -la /home/astrovaani.com/public_html/admindashboard/

# View server status
systemctl status lsws
```

### **Edit OpenLiteSpeed Config:**
```bash
# Edit vhost configuration
nano /usr/local/lsws/conf/vhosts/astrovaani.com/vhost.conf

# After editing, restart server
systemctl restart lsws

# Alternative restart command
/usr/local/lsws/bin/lswsctrl restart
```

### **Set File Permissions:**
```bash
# Navigate to admin folder
cd /home/astrovaani.com/public_html/admindashboard

# Set ownership
chown -R astrovaani:astrovaani .

# Set file permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### **Exit SSH:**
```bash
exit
```

---

## 🚫 **Issues Encountered**

### **Issue 1: 404 Not Found**
- **URL Tested:** 
  - http://astrovaani.com/admindashboard/
  - http://82.112.236.1/admindashboard/
  - https://astrovaani.com/admindashboard/
- **Error:** "404 Not Found - nginx/1.28.0"
- **Cause:** OpenLiteSpeed not routing to React app correctly

### **Issue 2: .htaccess Not Working**
- **Reason:** .htaccess only works with Apache
- **Server:** Using OpenLiteSpeed (different syntax)
- **Solution Needed:** OpenLiteSpeed rewrite rules or context configuration

### **Issue 3: CyberPanel Login Failed**
- **URL:** https://82.112.236.1:8090
- **Status:** Password reset from Hostinger but login still not working
- **Workaround:** Direct SSH configuration attempted

---

## 📁 **Files Created During Setup**

### **Local Files:**
- `e:\Astrovaani\astrovaani_web_fe\build\` - React production build
- `e:\Astrovaani\astrovaani_web_fe\DEPLOYMENT_GUIDE.md` - Initial deployment guide
- `e:\Astrovaani\astrovaani_web_fe\nginx-config.txt` - SSH commands reference
- `e:\Astrovaani\astrovaani_web_fe\fix-nginx.sh` - Automated fix script (not used)

### **Server Files:**
- `/home/astrovaani.com/public_html/admindashboard/` - Uploaded React app
- `/usr/local/lsws/conf/vhosts/astrovaani.com/vhost.conf.backup` - Config backup

---

## ✅ **Working Alternative: Vercel Deployment**

Since VPS configuration is complex, we're deploying to Vercel for testing:
- **Platform:** Vercel (Free tier)
- **Deployment:** Automatic via GitHub or CLI
- **URL:** Will be `https://astrovaani-admin.vercel.app` (or similar)
- **Advantage:** Zero configuration, automatic routing, free SSL

---

## 🔄 **Future Deployment Steps (When Testing Complete)**

### **Option A: Complete VPS Deployment via CyberPanel**

1. **Fix CyberPanel Access:**
   - Reset CyberPanel admin password via SSH:
   ```bash
   ssh root@82.112.236.1
   adminPass admin NewPassword123
   ```

2. **Configure via CyberPanel GUI:**
   - Login to: https://82.112.236.1:8090
   - Go to: Websites → astrovaani.com → Rewrite Rules
   - Add React routing rules

3. **Test and Verify:**
   - Visit: https://astrovaani.com/admindashboard/
   - Verify all routes work (login, vendors, scheduling)

---

### **Option B: Deploy to Subdomain**

Instead of `/admindashboard/`, use `admin.astrovaani.com`:

1. **Create Subdomain in CyberPanel:**
   - Websites → Create Website
   - Domain: `admin.astrovaani.com`

2. **Upload Files:**
   - Via FileZilla to: `/home/admin.astrovaani.com/public_html/`
   - Upload all files from `build/` to root

3. **DNS Configuration:**
   - Add A record: `admin` → `82.112.236.1`

4. **No Special Config Needed:**
   - Files in root = works automatically
   - React Router handled by .htaccess

---

### **Option C: Deploy to Root Domain**

Replace current PHP site with React app:

1. **Backup Current Site:**
   ```bash
   ssh root@82.112.236.1
   mv /home/astrovaani.com/public_html /home/astrovaani.com/public_html_backup
   mkdir /home/astrovaani.com/public_html
   ```

2. **Upload React App to Root:**
   - Via FileZilla: Upload to `/home/astrovaani.com/public_html/`
   - All React files go directly to root

3. **Access:**
   - URL: https://astrovaani.com/

---

## 🎯 **Recommended Solution**

**For Production (After Testing):**

### **Best Approach: Use Subdomain**

**URL:** `https://admin.astrovaani.com`

**Why:**
- ✅ No conflicts with existing PHP site
- ✅ Clean URL structure
- ✅ Easy SSL setup
- ✅ No complex routing configuration
- ✅ Can run both sites simultaneously

**Steps:**
1. Create subdomain in CyberPanel
2. Upload React build files to subdomain root
3. Configure DNS A record
4. Done! No additional config needed

---

## 📞 **Support Commands**

### **View Logs:**
```bash
# OpenLiteSpeed error log
tail -f /usr/local/lsws/logs/error.log

# Website access log
tail -f /home/astrovaani.com/logs/access.log

# Website error log
tail -f /home/astrovaani.com/logs/error.log
```

### **Restart Services:**
```bash
# Restart OpenLiteSpeed
systemctl restart lsws

# Restart MySQL
systemctl restart mysql

# Check service status
systemctl status lsws
```

### **File Permissions:**
```bash
# Fix ownership
chown -R astrovaani:astrovaani /home/astrovaani.com/public_html/admindashboard

# Fix permissions
chmod -R 755 /home/astrovaani.com/public_html/admindashboard
chmod 644 /home/astrovaani.com/public_html/admindashboard/.htaccess
```

---

## 🔐 **Important Credentials (Keep Secure!)**

```
VPS SSH:
- Host: 82.112.236.1
- User: root
- Pass: Astrovaani123@

FileZilla SFTP:
- Host: sftp://82.112.236.1
- User: root
- Pass: Astrovaani123@
- Port: 22

CyberPanel:
- URL: https://82.112.236.1:8090
- User: admin
- Pass: (needs to be reset)
```

---

## 📊 **Current Status Summary**

| Item | Status | Notes |
|------|--------|-------|
| VPS Access | ✅ Working | SSH connected successfully |
| FileZilla Upload | ✅ Complete | All files uploaded |
| Files on Server | ✅ Present | In `/admindashboard/` folder |
| OpenLiteSpeed Config | ⚠️ Attempted | Config added but not working |
| URL Access | ❌ Failed | 404 errors on all URLs |
| CyberPanel Access | ❌ Failed | Login not working |
| **Current Solution** | 🚀 Vercel | Testing on Vercel instead |

---

## 🎯 **Next Steps (After Vercel Testing)**

1. ✅ Complete testing on Vercel
2. ✅ Verify all features work (login, vendors, scheduling, WhatsApp)
3. ⏳ Fix CyberPanel access on VPS
4. ⏳ Create subdomain: `admin.astrovaani.com`
5. ⏳ Deploy to subdomain (easiest production solution)
6. ⏳ Configure DNS
7. ⏳ Test production deployment
8. ✅ Go live!

---

## 📝 **Lessons Learned**

1. **OpenLiteSpeed ≠ Apache:** .htaccess doesn't work the same way
2. **CyberPanel is Key:** GUI access makes configuration much easier
3. **Subdomain is Easier:** Avoid `/subfolder/` deployments when possible
4. **Vercel for Testing:** Cloud platforms are faster for testing
5. **Document Everything:** Keep credentials and steps documented

---

## 🆘 **Troubleshooting Guide**

### **If URL Shows 404:**
- Check files exist: `ls -la /home/astrovaani.com/public_html/admindashboard/`
- Check permissions: `ls -la` should show `astrovaani:astrovaani`
- Verify config: `cat /usr/local/lsws/conf/vhosts/astrovaani.com/vhost.conf`
- Check logs: `tail -f /usr/local/lsws/logs/error.log`

### **If CyberPanel Won't Login:**
- Reset password via SSH:
  ```bash
  ssh root@82.112.236.1
  adminPass admin YourNewPassword
  ```
- Clear browser cache and try again
- Try different browser

### **If Files Won't Upload:**
- Check FileZilla connection
- Verify root password
- Check disk space: `df -h`
- Check permissions on target folder

---

## ✅ **Deployment Checklist for Final Production**

```
Pre-Deployment:
☐ Test all features on Vercel
☐ Verify backend API connectivity
☐ Test WhatsApp notifications
☐ Check login/logout flow
☐ Test vendor management
☐ Test interview scheduling

VPS Preparation:
☐ Fix CyberPanel access
☐ Create admin subdomain
☐ Configure DNS A record
☐ Test DNS propagation

Deployment:
☐ Upload files via FileZilla
☐ Set file permissions
☐ Configure SSL (Let's Encrypt)
☐ Test HTTPS access
☐ Verify routing works

Post-Deployment:
☐ Test all pages load
☐ Test API calls
☐ Test WhatsApp flow
☐ Monitor error logs
☐ Backup configuration

Go Live:
☐ Update documentation
☐ Share access with team
☐ Monitor for 24 hours
☐ Celebrate! 🎉
```

---

**Document Created:** November 16, 2025  
**Last Updated:** November 16, 2025  
**Status:** VPS files uploaded, testing on Vercel  
**Next Action:** Complete Vercel deployment for testing  

---

*Keep this document safe! It contains all the information needed to deploy to production later.*
