@echo off
echo ========================================
echo   Build Web Estatica - HabitoFlow
echo ========================================
echo.

echo Criando build de producao...
call npm run web:build

echo.
if exist "dist\index.html" (
    echo Build concluida com sucesso!
    echo.
    echo Iniciando servidor...
    cd dist
    python -m http.server 9000
) else (
    echo ERRO: Build falhou!
    echo Tente executar: npm run web
)

pause