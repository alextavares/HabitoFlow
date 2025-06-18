@echo off
echo ========================================
echo   HabitoFlow - Versao Simplificada
echo ========================================
echo.

echo Matando processos antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo Iniciando app simplificado...
echo Acesse em: http://localhost:7000
echo.

npx webpack serve --config webpack.config.minimal.js

pause