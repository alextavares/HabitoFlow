@echo off
echo ========================================
echo    CONFIGURANDO DISPOSITIVO ANDROID
echo ========================================

REM Configurar variaveis de ambiente
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

echo.
echo 1. Verificando dispositivos conectados...
adb devices

echo.
echo 2. Se nenhum dispositivo apareceu acima:
echo    - Conecte o celular via USB
echo    - Ative "Depuracao USB" nas configuracoes
echo    - Aceite a permissao quando aparecer no celular

echo.
echo 3. Pressione qualquer tecla para tentar novamente...
pause

echo.
echo Verificando novamente...
adb devices

echo.
echo 4. Se o dispositivo apareceu, pressione qualquer tecla para instalar o app...
pause

echo.
echo Instalando HabitoFlow no dispositivo...
cd android
gradlew installDebug

echo.
echo ========================================
echo     INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo O app foi instalado no seu celular!
echo Procure por "HabitoFlow" na lista de apps.
echo.
pause