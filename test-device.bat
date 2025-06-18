@echo off
echo ========================================
echo     TESTE NO DISPOSITIVO FISICO
echo ========================================
echo.

echo 1. CONECTE SEU CELULAR:
echo    - Cabo USB conectado
echo    - Depuracao USB ativada
echo    - Aceite permissoes no celular
echo.

echo 2. Limpando build anterior...
cd android
call gradlew clean

echo.
echo 3. Compilando para dispositivo...
call gradlew assembleDebug

echo.
echo 4. Verificando dispositivos conectados...
adb devices

echo.
echo 5. Instalando no dispositivo...
adb install app\build\outputs\apk\debug\app-debug.apk

echo.
echo ========================================
echo         INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo ✅ HabitoFlow foi instalado no seu celular!
echo.
echo 📱 FUNCIONALIDADES PARA TESTAR:
echo    ✅ Login com email ou Google
echo    ✅ Criar habitos personalizados
echo    ✅ Marcar como concluido (toque no checkmark)
echo    ✅ Deslizar para esquerda nos habitos:
echo       - Botao AZUL = Editar
echo       - Botao VERMELHO = Deletar
echo    ✅ Ver calendario (botao 📅)
echo    ✅ Tema claro/escuro (switch no header)
echo    ✅ Sincronizacao em tempo real
echo.
echo 🔥 Teste criar habitos e marcar como concluidos
echo    para ver as sequences (streaks) funcionando!
echo.
pause