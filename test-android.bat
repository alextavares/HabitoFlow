@echo off
echo ========================================
echo Testando HabitoFlow no Android
echo ========================================
echo.

echo 1. Verificando dispositivos conectados...
adb devices
echo.

echo 2. Iniciando Metro bundler em nova janela...
start cmd /k "npm start"

echo 3. Aguardando Metro iniciar...
timeout /t 5 /nobreak > nul

echo 4. Executando no Android...
npx react-native run-android

echo.
echo ========================================
echo Se houver erros, tente:
echo 1. Conectar um dispositivo Android via USB
echo 2. Ativar modo desenvolvedor no dispositivo
echo 3. Ou iniciar um emulador Android Studio
echo ========================================