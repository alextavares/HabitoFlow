@echo off
echo ========================================
echo     HabitoFlow - App Completo
echo ========================================
echo.

echo [1/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --legacy-peer-deps
)

echo.
echo [2/4] Matando processos antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [3/4] Iniciando Metro Bundler...
start /min cmd /c "npx react-native start"

echo.
echo [4/4] Iniciando servidor web...
echo.
echo ========================================
echo Aguarde a compilacao...
echo O app abrira em: http://localhost:8080
echo ========================================
echo.

npm run web

pause