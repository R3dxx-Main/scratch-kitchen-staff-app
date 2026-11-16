@echo off
title Scratch Kitchen Staff app
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install it from nodejs.org, restart the computer, then double-click this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing the app's packages. The first time takes a few minutes...
  call npm install
  if errorlevel 1 (
    echo.
    echo The install did not finish. Check the internet connection and double-click this file again.
    pause
    exit /b 1
  )
)

call npx expo whoami >nul 2>nul
if errorlevel 1 (
  echo.
  echo ============================================================
  echo  Sign in to Expo with the same account as Expo Go on your phone.
  echo  Type your Expo username or email, press Enter, then your password.
  echo ============================================================
  call npx expo login
  if errorlevel 1 (
    echo Sign-in did not finish. Double-click this file to try again.
    pause
    exit /b 1
  )
)

echo.
echo ============================================================
echo  Starting the Scratch Kitchen Staff app.
echo  1. Install "Expo Go" on your phone (App Store or Google Play).
echo  2. When the QR code appears below, scan it:
echo       iPhone: with the Camera app.  Android: inside Expo Go.
echo  3. Phone and computer must be on the same Wi-Fi.
echo  If Windows asks to allow network access, click Allow.
echo  To stop the app, close this window.
echo ============================================================
echo.
call npx expo start
pause
