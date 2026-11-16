@echo off
title Publish the Scratch Kitchen web app
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
echo Building the web version...
if exist dist rmdir /s /q dist
call npx expo export --platform web
if errorlevel 1 (
  echo.
  echo The web version could not be built. Take a photo of this window and send it to Claude.
  pause
  exit /b 1
)
echo.
echo Putting it online with Expo Hosting...
call npx --yes eas-cli@latest deploy --prod --non-interactive
if errorlevel 1 (
  echo.
  echo It could not be put online. Take a photo of this window and send it to Claude.
  pause
  exit /b 1
)
echo.
echo ============================================================
echo  Done. The web address ending in .expo.app above is the app.
echo  Open it on any phone, sign in, then add it to the home screen:
echo   iPhone/iPad: Safari, Share button, Add to Home Screen.
echo   Android: Chrome, menu, Add to Home screen or Install app.
echo ============================================================
pause
