@echo off
echo ========================================
echo   HabitoFlow - Rodar no Android
echo ========================================
echo.

echo [1/5] Verificando ADB...
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: ADB nao encontrado!
    echo.
    echo Instale o Android Studio ou Android SDK Tools
    echo https://developer.android.com/studio
    echo.
    pause
    exit /b 1
)

echo OK: ADB encontrado
echo.

echo [2/5] Verificando dispositivos conectados...
adb devices
echo.

echo [3/5] Verificando Java...
java -version
echo.

echo [4/5] Limpando Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [5/5] Iniciando app no Android...
echo.
echo IMPORTANTE:
echo - Conecte seu celular via USB com Depuracao USB ativada
echo - Ou inicie um emulador Android Studio
echo.
echo Iniciando em 5 segundos...
timeout /t 5 /nobreak > nul

npm run android

pause