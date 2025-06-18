@echo off
echo Reiniciando servidor web...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul
npm run web