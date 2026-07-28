@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
"C:\Program Files\nodejs\node.exe" server.js
