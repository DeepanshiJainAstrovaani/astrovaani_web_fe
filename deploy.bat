@echo off
echo ========================================
echo    Astrovaani Frontend Deployment
echo ========================================
echo.

echo [1/3] Building production bundle...
call npm run build
if errorlevel 1 (
    echo Error: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully!
echo.

echo [2/3] Creating .htaccess file...
(
echo ^<IfModule mod_rewrite.c^>
echo   RewriteEngine On
echo   RewriteBase /
echo   RewriteRule ^^index\.html$ - [L]
echo   RewriteCond %%{REQUEST_FILENAME} !-f
echo   RewriteCond %%{REQUEST_FILENAME} !-d
echo   RewriteCond %%{REQUEST_FILENAME} !-l
echo   RewriteRule . /index.html [L]
echo ^</IfModule^>
) > build\.htaccess
echo ✓ .htaccess created!
echo.

echo [3/3] Creating deployment package...
cd build
tar -czf ..\astrovaani-frontend-deploy.tar.gz *
cd ..
echo ✓ Deployment package created: astrovaani-frontend-deploy.tar.gz
echo.

echo ========================================
echo    ✅ DEPLOYMENT READY!
echo ========================================
echo.
echo Next steps:
echo 1. Upload the 'build' folder to Hostinger File Manager
echo 2. Or extract 'astrovaani-frontend-deploy.tar.gz' on your server
echo 3. Make sure .htaccess is in the same folder
echo.
echo Frontend will be live at: https://astrovaani.com/
echo Backend API: https://astrovaani-be.onrender.com/api
echo.
pause
