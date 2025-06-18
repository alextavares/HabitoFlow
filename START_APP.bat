@echo off
title HabitoFlow Web Server
echo ========================================
echo         HabitoFlow - App de Habitos
echo ========================================
echo.

echo [1/4] Limpando processos antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
)

echo.
echo [3/4] Iniciando servidor web...
echo.
echo ========================================
echo    O app vai abrir em instantes em:
echo    
echo    http://localhost:8080
echo    
echo    Aguarde o webpack compilar...
echo ========================================
echo.

npm run web

pause