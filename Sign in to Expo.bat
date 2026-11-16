@echo off
title Sign in to Expo
cd /d "%~dp0"
echo ============================================================
echo  Sign in to Expo with the SAME account as Expo Go on your phone
echo  (your phone shows it is signed in as r3dxx).
echo.
echo  1. A page on expo.dev opens in your web browser.
echo     If it does not, click the long expo.dev link shown below.
echo  2. Sign in there, then come back to this window.
echo ============================================================
echo.
call npx expo login
if errorlevel 1 (
  echo.
  echo Sign-in did not work. Check the username and password, then double-click this file again.
  pause
  exit /b 1
)
echo.
echo Signed in. Now close this window and double-click "Start Scratch Kitchen App.bat".
pause
