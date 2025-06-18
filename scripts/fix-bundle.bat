@echo off
echo ========================================
echo    Corrigindo Bundle do Android
echo ========================================
echo.

echo Criando pasta assets se necessario...
if not exist "android\app\src\main\assets" (
    mkdir android\app\src\main\assets
)

echo.
echo Gerando bundle JavaScript...
echo Isso pode demorar 1-2 minutos...
echo.

call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

if %errorlevel% neq 0 (
    echo.
    echo ERRO ao gerar bundle!
    echo Tente executar novamente ou use o comando abaixo manualmente:
    echo npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle
) else (
    echo.
    echo Bundle gerado com sucesso!
    echo.
    echo Agora execute novamente:
    echo npm run android
)

echo.
pause