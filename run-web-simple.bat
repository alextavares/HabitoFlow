@echo off
echo ========================================
echo HabitoFlow - Versao Web Simplificada
echo ========================================
echo.

echo Matando processos antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo Iniciando servidor web...
echo Acesse em: http://localhost:8080
echo.

npx webpack serve --config webpack.config.simple.js

pause