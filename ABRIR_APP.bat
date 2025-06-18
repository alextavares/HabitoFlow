@echo off
echo ========================================
echo     HabitoFlow - Abrindo no Navegador
echo ========================================
echo.
echo Iniciando servidor...
start /B python server.py
timeout /t 2 /nobreak > nul
echo.
echo Abrindo navegador...
start http://localhost:8000
echo.
echo ========================================
echo Servidor rodando em: http://localhost:8000
echo Pressione Ctrl+C para parar
echo ========================================
pause