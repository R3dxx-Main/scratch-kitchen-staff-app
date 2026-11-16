@echo off
title Scratch Kitchen Staff app (in a browser)
cd /d "%~dp0"
if not exist node_modules (
  echo Installing the app's packages. The first time takes a few minutes...
  call npm install
)
echo Opening the app in your web browser...
call npx expo start --web
pause
