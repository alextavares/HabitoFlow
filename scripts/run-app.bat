@echo off
echo ========================================
echo    HabitoFlow - Iniciando App
echo ========================================
echo.

echo [1] Verificando emulador...
adb devices | findstr "device" >nul
if %errorlevel% neq 0 (
    echo ERRO: Nenhum dispositivo/emulador encontrado!
    echo.
    echo Por favor:
    echo 1. Abra o Android Studio
    echo 2. Va em Tools - AVD Manager
    echo 3. Crie ou inicie um emulador
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo OK - Dispositivo encontrado
echo.

echo [2] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
)
echo OK - Dependencias instaladas
echo.

echo [3] Criando pasta assets se necessario...
if not exist "android\app\src\main\assets" (
    mkdir android\app\src\main\assets
)

echo [4] Limpando cache anterior...
cd android
call gradlew clean
cd ..
echo.

echo [5] Iniciando Metro Bundler em nova janela...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"

echo [6] Aguardando Metro iniciar...
timeout /t 5 /nobreak >nul

echo [7] Instalando app no dispositivo...
echo Isso pode demorar alguns minutos na primeira vez...
echo.
call npx react-native run-android

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo    ERRO ao executar o app!
    echo ========================================
    echo Possiveis solucoes:
    echo 1. Verifique se o emulador esta rodando
    echo 2. Execute 'adb devices' para confirmar
    echo 3. Tente: adb reverse tcp:8081 tcp:8081
    echo 4. Verifique o arquivo google-services.json
    echo.
) else (
    echo.
    echo ========================================
    echo    App iniciado com sucesso!
    echo ========================================
    echo O app deve abrir no emulador em breve.
    echo.
    echo Dicas:
    echo - Ctrl+M no emulador: Menu de debug
    echo - R,R no Metro: Recarregar app
    echo - Mantenha as janelas abertas
    echo.
)

pause