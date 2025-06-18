@echo off
echo ========================================
echo    HabitoFlow - Modo Desenvolvimento
echo ========================================
echo.

echo IMPORTANTE: Certifique-se de que:
echo 1. O emulador Android esta rodando
echo 2. Voce pode ver o emulador na tela
echo.
pause

echo.
echo Verificando dispositivos...
adb devices
echo.

echo Configurando redirecionamento de porta...
adb reverse tcp:8081 tcp:8081

echo.
echo ========================================
echo    INSTRUCOES:
echo ========================================
echo 1. Abra OUTRO terminal/PowerShell
echo 2. Navegue ate: C:\codigos\pesquisarpp\HabitoFlow
echo 3. Execute: npm start
echo 4. Aguarde aparecer "Loading dependency graph, done"
echo 5. Volte AQUI e pressione qualquer tecla
echo.
pause

echo.
echo Executando app no Android...
npm run android

pause