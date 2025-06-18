@echo off
echo ========================================
echo      GERANDO APK DO HABITOFLOW
echo ========================================

echo.
echo 1. Limpando build anterior...
cd android
call gradlew clean

echo.
echo 2. Gerando APK de debug...
call gradlew assembleDebug

echo.
echo 3. Procurando APK gerado...
dir app\build\outputs\apk\debug\*.apk

echo.
echo ========================================
echo         APK GERADO COM SUCESSO!
echo ========================================
echo.
echo O APK foi gerado em:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar:
echo 1. Copie o arquivo APK para o celular
echo 2. Abra o arquivo no celular
echo 3. Aceite instalar de "Fontes desconhecidas"
echo.
pause