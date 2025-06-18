@echo off
echo ========================================
echo Instalando dependencias do HabitoFlow
echo ========================================
echo.

echo Verificando Java...
java -version

echo.
echo Instalando com --legacy-peer-deps...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo Proximos passos:
echo 1. Execute: npm run android
echo 2. Ou: .\run-android.bat
echo.