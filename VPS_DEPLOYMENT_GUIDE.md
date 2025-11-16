# 🖥️ VPS Deployment Guide (CyberPanel)

## Full MERN Stack on VPS

---

## 📋 **Deployment Architecture**

```
Your VPS (CyberPanel)
├── Frontend: React build in public_html
├── Backend: Node.js app with PM2
├── Database: MongoDB (local or remote)
└── Web Server: OpenLiteSpeed/Apache
```

---

## ⚠️ **IMPORTANT: Choose Your Deployment Strategy**

### **Strategy A: Hybrid (RECOMMENDED - What you have now)**
- ✅ Backend on Render (already deployed)
- ✅ Frontend on Hostinger/CyberPanel (static files)
- ✅ **Easiest - No VPS configuration needed!**

### **Strategy B: Full VPS (This guide)**
- Backend + Frontend both on CyberPanel
- Requires Node.js setup, PM2, reverse proxy
- More control but more complex

**If you're happy with Backend on Render, skip this and use the simple Hostinger upload!**

---

## 🚀 **VPS Deployment Steps (If you choose Strategy B)**

### **Step 1: Prepare VPS (CyberPanel)**

1. **SSH into VPS**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   node --version
   npm --version
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

4. **Install MongoDB (Optional - if you want local DB)**
   ```bash
   # Skip this if using remote MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

---

### **Step 2: Deploy Backend (Node.js)**

1. **Create app directory**
   ```bash
   cd /home
   mkdir astrovaani-backend
   cd astrovaani-backend
   ```

2. **Upload backend files**
   - Option A: Use Git
     ```bash
     git clone https://github.com/YOUR_USERNAME/astrovaani.git .
     cd Astrovaani_BE
     ```
   
   - Option B: Upload via SFTP
     - Use FileZilla/WinSCP
     - Upload `Astrovaani_BE` folder to `/home/astrovaani-backend/`

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create .env file**
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ICONIC_API_KEY=your_whatsapp_api_key
   WHATSAPP_API_URL=https://wa.iconicsolution.co.in/wapp/api/send/bytemplate
   SITE_BASE_URL=https://astrovaani.com
   ```

5. **Start with PM2**
   ```bash
   pm2 start server.js --name astrovaani-backend
   pm2 save
   pm2 startup
   ```

6. **Check if running**
   ```bash
   pm2 status
   pm2 logs astrovaani-backend
   ```

---

### **Step 3: Configure Reverse Proxy (CyberPanel)**

1. **Create subdomain for API**
   - Login to CyberPanel
   - Go to: **Websites** → **Create Website**
   - Domain: `api.astrovaani.com` (or use main domain)

2. **Configure reverse proxy**
   
   Edit vhost config:
   ```bash
   nano /usr/local/lsws/conf/vhosts/astrovaani.com/vhost.conf
   ```

   Add:
   ```nginx
   location /api {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   }
   ```

3. **Restart web server**
   ```bash
   systemctl restart lsws
   ```

4. **Test API**
   ```bash
   curl http://localhost:5000/api/vendors
   curl https://astrovaani.com/api/vendors
   ```

---

### **Step 4: Deploy Frontend (React)**

1. **Build React app** (on your local machine)
   ```bash
   cd e:\Astrovaani\astrovaani_web_fe
   ```

2. **Update .env for VPS**
   ```env
   REACT_APP_API_URL=https://astrovaani.com/api
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Upload to VPS**
   
   **Option A: Via CyberPanel File Manager**
   - Login to CyberPanel
   - Go to: **File Manager**
   - Navigate to: `/home/astrovaani.com/public_html/`
   - Upload all files from `build/` folder

   **Option B: Via SFTP**
   ```bash
   # On your local machine
   cd build
   scp -r * root@your-vps-ip:/home/astrovaani.com/public_html/
   ```

5. **Create .htaccess**
   ```bash
   nano /home/astrovaani.com/public_html/.htaccess
   ```
   
   Add:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_FILENAME} !-l
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

### **Step 5: SSL Certificate (HTTPS)**

1. **In CyberPanel**
   - Go to: **SSL** → **Manage SSL**
   - Select your domain
   - Click **"Issue SSL"**
   - Wait for certificate issuance

2. **Or use Certbot**
   ```bash
   apt-get install certbot
   certbot --apache -d astrovaani.com -d www.astrovaani.com
   ```

---

## 🔄 **Deployment Summary**

```
VPS Setup:
├── Node.js installed ✅
├── PM2 installed ✅
├── MongoDB (optional) ✅
└── SSL certificate ✅

Backend:
├── Code uploaded ✅
├── Dependencies installed ✅
├── PM2 running ✅
└── API accessible at /api ✅

Frontend:
├── Build uploaded ✅
├── .htaccess configured ✅
└── Routes working ✅
```

---

## 📊 **URLs After Deployment**

- **Frontend:** https://astrovaani.com/
- **Admin:** https://astrovaani.com/admin/
- **Backend API:** https://astrovaani.com/api/
- **Interview Page:** https://astrovaani.com/interview?code=XXX

---

## 🔧 **Useful PM2 Commands**

```bash
# Check status
pm2 status

# View logs
pm2 logs astrovaani-backend

# Restart app
pm2 restart astrovaani-backend

# Stop app
pm2 stop astrovaani-backend

# Monitor
pm2 monit

# Startup on boot
pm2 startup
pm2 save
```

---

## ⚡ **Update Deployment (After Code Changes)**

### **Backend Update:**
```bash
cd /home/astrovaani-backend/Astrovaani_BE
git pull origin main
npm install
pm2 restart astrovaani-backend
```

### **Frontend Update:**
```bash
# On local machine
cd e:\Astrovaani\astrovaani_web_fe
npm run build

# Upload new build to VPS
scp -r build/* root@your-vps-ip:/home/astrovaani.com/public_html/
```

---

## 🎯 **RECOMMENDATION**

**For your case, I recommend:**

### **Keep Current Setup (Easiest):**
```
Backend → Render (already working!) ✅
Frontend → Hostinger (just upload build folder) ✅
Database → Remote MongoDB ✅
```

**Why?**
- ✅ No VPS configuration needed
- ✅ Automatic SSL on both platforms
- ✅ Auto-scaling on Render
- ✅ Free SSL on Hostinger
- ✅ Less maintenance

**Only use VPS if:**
- You need full control
- You want everything in one place
- You have specific server requirements
- You're comfortable with Linux/server management

---

## 📞 **Support**

**Common Issues:**

1. **Backend not starting**
   - Check: `pm2 logs`
   - Verify: .env file exists
   - Check: Port 5000 is available

2. **API not accessible**
   - Check: Reverse proxy config
   - Verify: PM2 is running
   - Test: `curl http://localhost:5000/api/vendors`

3. **Frontend routes 404**
   - Check: .htaccess uploaded
   - Verify: mod_rewrite enabled

---

## ⏱️ **Deployment Time**

- VPS Setup: 30-60 minutes
- Backend deployment: 15-20 minutes
- Frontend deployment: 10 minutes
- SSL setup: 5-10 minutes

**Total: ~1-2 hours** (for first-time setup)

vs.

**Hostinger upload: 5-10 minutes** ⭐

---

**Your choice! Both work perfectly for MERN stack. The current setup with Render + Hostinger is actually recommended for most cases!** 🚀
