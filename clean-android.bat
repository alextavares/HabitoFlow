@echo off
echo ========================================
echo   Limpando Build Android
echo ========================================
echo.

cd android

echo [1/4] Parando Gradle daemons...
call gradlew --stop

echo.
echo [2/4] Limpando cache do Gradle...
if exist ".gradle" (
    rmdir /s /q .gradle
)
if exist "app\build" (
    rmdir /s /q app\build
)

echo.
echo [3/4] Limpando projeto...
call gradlew clean

echo.
echo [4/4] Voltando para pasta principal...
cd ..

echo.
echo Limpeza concluida!
echo Agora execute: npm run android
echo.
pause