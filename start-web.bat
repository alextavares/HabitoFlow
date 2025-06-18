@echo off
echo ========================================
echo Iniciando HabitoFlow Web
echo ========================================
echo.

echo Matando processos node antigos...
taskkill /F /IM node.exe 2>nul

echo.
echo Iniciando servidor web...
echo Acesse em: http://localhost:8080
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

npm run web