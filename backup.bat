@echo off
REM Data Backup Script for Render (Windows)
REM Run this before each session to backup users.json, items.json, and uploads to GitHub

echo.
echo 🔄 Starting data backup to GitHub...
echo.

REM Check if we're in the Node backend directory
if not exist "app.js" (
  echo ❌ Error: Please run this script from the Node backend directory (d:\React + Node\Node)
  pause
  exit /b 1
)

REM Add data files
echo 📦 Staging data files...
git add src\db\users.json src\db\items.json uploads\ 2>nul
if errorlevel 1 echo ⚠️  Some files may not exist yet

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
  echo ✅ No changes to backup.
  exit /b 0
)

REM Commit
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
echo 💾 Committing with timestamp...
git commit -m "backup: save users, items, and uploads data (%mydate% %mytime%)"

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main
if %errorlevel% equ 0 (
  echo.
  echo ✅ Backup complete! Data saved to GitHub.
  echo.
) else (
  echo ❌ Push failed. Check your git configuration.
  pause
  exit /b 1
)
