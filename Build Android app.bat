@echo off
title Build the Scratch Kitchen Android app
cd /d "%~dp0"
rem This folder is not a git checkout, so tell Expo's tools to use the files as they are.
set EAS_NO_VCS=1

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install it from nodejs.org, restart the computer, then double-click this file again.
  pause
  exit /b 1
)

echo Checking the app's packages...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo The install did not finish. Check the internet connection and double-click this file again.
  pause
  exit /b 1
)

call npx expo whoami >nul 2>nul
if errorlevel 1 (
  echo.
  echo Sign in to Expo first. A page on expo.dev opens in your browser: sign in there.
  call npx expo login
  if errorlevel 1 (
    echo Sign-in did not finish. Double-click this file to try again.
    pause
    exit /b 1
  )
)

echo.
echo Connecting this project to your Expo account (only does something the first time)...
call npx --yes eas-cli@latest init --non-interactive --force
if errorlevel 1 (
  echo.
  echo Could not connect the project to Expo. Take a photo of this window and send it to Claude.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  Sending the Android app to Expo's build service.
echo  This window only starts the build. The build itself runs in
echo  Expo's cloud and usually takes 10 to 90 minutes.
echo ============================================================
echo.
call npx --yes eas-cli@latest build --platform android --profile preview --non-interactive --no-wait
if errorlevel 1 (
  echo.
  echo The build could not be started. Take a photo of this window and send it to Claude.
  pause
  exit /b 1
)
echo.
echo ============================================================
echo  Build started. When it is finished:
echo   1. On an Android phone, go to expo.dev and sign in.
echo   2. Open the scratch-kitchen-staff project, then Builds.
echo   3. Tap the newest Android build, then Install.
echo  Or open the "Build details" link above on any device.
echo ============================================================
pause
