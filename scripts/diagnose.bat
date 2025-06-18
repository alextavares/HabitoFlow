@echo off
echo ========================================
echo    HabitoFlow - Diagnostico do Ambiente
echo ========================================
echo.

echo [1] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Instale em: https://nodejs.org/
) else (
    echo OK - Node.js instalado
)
echo.

echo [2] Verificando Java...
java -version 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Java nao encontrado!
    echo Verifique a instalacao do JDK 17
) else (
    echo OK - Java instalado
)
echo.

echo [3] Verificando Android SDK...
if "%ANDROID_HOME%"=="" (
    echo ERRO: ANDROID_HOME nao configurado!
    echo Configure a variavel de ambiente ANDROID_HOME
) else (
    echo OK - ANDROID_HOME: %ANDROID_HOME%
)
echo.

echo [4] Verificando ADB...
adb --version 2>&1
if %errorlevel% neq 0 (
    echo ERRO: ADB nao encontrado!
    echo Verifique a instalacao do Android SDK
) else (
    echo OK - ADB instalado
)
echo.

echo [5] Verificando emuladores/dispositivos...
adb devices
echo.

echo [6] Verificando dependencias do projeto...
if exist "node_modules" (
    echo OK - node_modules existe
) else (
    echo AVISO: node_modules nao encontrado
    echo Execute: npm install
)
echo.

echo [7] Verificando arquivo google-services.json...
if exist "android\app\google-services.json" (
    echo OK - google-services.json encontrado
) else (
    echo ERRO: google-services.json nao encontrado!
    echo Baixe do Firebase Console
)
echo.

echo ========================================
echo    Proximos passos:
echo ========================================
echo 1. Corrija qualquer erro acima
echo 2. Abra o Android Studio e inicie um emulador
echo 3. Execute: npm start (em um terminal)
echo 4. Execute: npm run android (em outro terminal)
echo.
pause