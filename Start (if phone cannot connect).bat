@echo off
title Scratch Kitchen Staff app (phone can't connect)
cd /d "%~dp0"
rem Use this if the phone can't reach the computer on Wi-Fi.
rem It connects through the internet instead, which is slower but works on any network.
if not exist node_modules (
  echo Installing the app's packages. The first time takes a few minutes...
  call npm install
)
echo.
echo Starting through the internet. If it asks to install @expo/ngrok, type y and press Enter.
echo Then scan the QR code with Expo Go.
echo.
call npx expo start --tunnel
pause
