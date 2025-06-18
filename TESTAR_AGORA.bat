@echo off
echo ========================================
echo     TESTE IMEDIATO - HabitoFlow
echo ========================================
echo.

echo Matando processos antigos...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo Iniciando servidor de teste...
python teste-simples.py

pause