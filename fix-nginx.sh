#!/bin/bash

# Automatic Nginx Configuration Script for React App

echo "Finding Nginx config..."

# Check if config exists
if [ -f "/etc/nginx/sites-available/astrovaani.com" ]; then
    CONFIG_FILE="/etc/nginx/sites-available/astrovaani.com"
elif [ -f "/etc/nginx/conf.d/astrovaani.com.conf" ]; then
    CONFIG_FILE="/etc/nginx/conf.d/astrovaani.com.conf"
else
    echo "Config file not found. Searching..."
    find /etc/nginx -name "*astrovaani*"
    find /usr/local -name "*astrovaani*"
    exit 1
fi

echo "Found config: $CONFIG_FILE"

# Backup original config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

# Add React routing configuration
cat >> "$CONFIG_FILE" << 'EOF'

# React App - Admin Dashboard
location /admindashboard {
    alias /home/astrovaani.com/public_html/admindashboard;
    try_files $uri $uri/ /admindashboard/index.html;
    index index.html;
}
EOF

echo "Configuration added!"

# Test Nginx config
nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration is valid. Restarting Nginx..."
    systemctl restart nginx || systemctl restart lsws || service nginx restart
    echo "Done! Visit: http://astrovaani.com/admindashboard/"
else
    echo "Configuration error! Restoring backup..."
    cp "$CONFIG_FILE.backup" "$CONFIG_FILE"
fi
