@echo off
title SSJ COSMOS - Open World Simulator
cd /d "%~dp0"
echo ==============================================================
echo   SSJ COSMOS - OPEN WORLD SIMULATOR
echo   Launching local server on port 6767...
echo ==============================================================
start "SSJ COSMOS Server" /b node server.js
timeout /t 2 /nobreak >nul
start "" http://localhost:6767/
exit
