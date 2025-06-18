@echo off
echo ========================================
echo   Verificando Servidor HabitoFlow
echo ========================================
echo.

echo Testando conexao com o servidor...
curl -s -o nul -w "Status HTTP: %%{http_code}\n" http://localhost:8888/habitoflow-standalone.html

echo.
echo Se o status for 200, o servidor esta funcionando!
echo.
echo ========================================
echo   URLs para acessar:
echo ========================================
echo.
echo 1. http://localhost:8888/habitoflow-standalone.html
echo 2. http://127.0.0.1:8888/habitoflow-standalone.html
echo.
echo ========================================
pause