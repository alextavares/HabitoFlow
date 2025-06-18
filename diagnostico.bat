@echo off
echo ========================================
echo   DIAGNOSTICO COMPLETO - HabitoFlow
echo ========================================
echo.

echo [1/7] Verificando Python...
python --version 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado!
    echo Instale em: https://www.python.org/downloads/
) else (
    echo OK: Python instalado
)
echo.

echo [2/7] Verificando Node.js...
node --version 2>nul
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
) else (
    echo OK: Node.js instalado
)
echo.

echo [3/7] Verificando NPM...
npm --version 2>nul
if %errorlevel% neq 0 (
    echo ERRO: NPM nao encontrado!
) else (
    echo OK: NPM instalado
)
echo.

echo [4/7] Verificando Java...
java -version 2>&1
echo.

echo [5/7] Verificando portas em uso...
echo Portas comuns:
netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo - Porta 3000: EM USO
) else (
    echo - Porta 3000: LIVRE
)

netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo - Porta 5000: EM USO
) else (
    echo - Porta 5000: LIVRE
)

netstat -an | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo - Porta 8000: EM USO
) else (
    echo - Porta 8000: LIVRE
)

netstat -an | findstr :8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo - Porta 8080: EM USO
) else (
    echo - Porta 8080: LIVRE
)
echo.

echo [6/7] Verificando Firewall...
netsh advfirewall show allprofiles | findstr State
echo.

echo [7/7] Verificando dependencias do projeto...
if exist "node_modules" (
    echo OK: node_modules existe
    dir node_modules | find "File(s)" | find /v "bytes"
) else (
    echo ERRO: node_modules NAO existe!
    echo Execute: npm install --legacy-peer-deps
)
echo.

echo ========================================
echo   SALVANDO LOGS DETALHADOS...
echo ========================================

echo Coletando informacoes do sistema... > diagnostico_completo.log
echo. >> diagnostico_completo.log
echo === SISTEMA === >> diagnostico_completo.log
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" >> diagnostico_completo.log
echo. >> diagnostico_completo.log

echo === VERSOES === >> diagnostico_completo.log
echo Python: >> diagnostico_completo.log
python --version >> diagnostico_completo.log 2>&1
echo. >> diagnostico_completo.log
echo Node: >> diagnostico_completo.log
node --version >> diagnostico_completo.log 2>&1
echo. >> diagnostico_completo.log
echo NPM: >> diagnostico_completo.log
npm --version >> diagnostico_completo.log 2>&1
echo. >> diagnostico_completo.log
echo Java: >> diagnostico_completo.log
java -version >> diagnostico_completo.log 2>&1
echo. >> diagnostico_completo.log

echo === PORTAS EM USO === >> diagnostico_completo.log
netstat -an | findstr LISTENING >> diagnostico_completo.log
echo. >> diagnostico_completo.log

echo === PROCESSOS NODE === >> diagnostico_completo.log
tasklist | findstr node >> diagnostico_completo.log 2>&1
echo. >> diagnostico_completo.log

echo === ERROS NPM === >> diagnostico_completo.log
if exist "npm-debug.log" (
    type npm-debug.log >> diagnostico_completo.log
)
echo. >> diagnostico_completo.log

echo.
echo Logs salvos em: diagnostico_completo.log
echo.
echo ========================================
echo   TESTE RAPIDO DE SERVIDOR
echo ========================================
echo.
echo Criando servidor de teste minimo...

echo ^<!DOCTYPE html^> > test_minimo.html
echo ^<html^>^<head^>^<title^>Teste^</title^>^</head^> >> test_minimo.html
echo ^<body style="font-family:Arial; text-align:center; padding:50px;"^> >> test_minimo.html
echo ^<h1^>HabitoFlow - Teste Minimo^</h1^> >> test_minimo.html
echo ^<p^>Se voce esta vendo isso, o servidor funciona!^</p^> >> test_minimo.html
echo ^<p^>Data/Hora: ^<script^>document.write(new Date())^</script^>^</p^> >> test_minimo.html
echo ^</body^>^</html^> >> test_minimo.html

echo.
echo Tentando iniciar servidor Python simples...
echo.
start cmd /k "python -m http.server 8888"
timeout /t 3 /nobreak > nul
start http://localhost:8888/test_minimo.html

echo.
echo ========================================
echo Se o navegador abriu, o servidor funciona!
echo Senao, verifique o arquivo: diagnostico_completo.log
echo ========================================
pause