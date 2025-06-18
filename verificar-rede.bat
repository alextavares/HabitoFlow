@echo off
echo ========================================
echo   VERIFICACAO DE REDE E CONECTIVIDADE
echo ========================================
echo.

echo [1] Testando localhost...
ping -n 1 localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: localhost responde
) else (
    echo ERRO: localhost nao responde!
)

echo.
echo [2] Verificando 127.0.0.1...
ping -n 1 127.0.0.1 >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: 127.0.0.1 responde
) else (
    echo ERRO: 127.0.0.1 nao responde!
)

echo.
echo [3] Listando interfaces de rede...
ipconfig | findstr /R "IPv4.*127\.0\.0\.1"
if %errorlevel% neq 0 (
    echo Verificando loopback...
    ipconfig /all | findstr /i "loopback"
)

echo.
echo [4] Verificando hosts file...
type C:\Windows\System32\drivers\etc\hosts | findstr localhost

echo.
echo [5] Testando curl no localhost...
curl http://localhost:9999 >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: curl consegue acessar localhost
) else (
    echo INFO: curl nao pode acessar (normal se servidor nao estiver rodando)
)

echo.
echo [6] Verificando configuracao do Windows Defender Firewall...
netsh advfirewall firewall show rule name=all | findstr /i "python node"

echo.
echo ========================================
echo   CRIANDO REGRA DE FIREWALL
echo ========================================
echo.
echo Adicionando excecao para Python no Firewall...
netsh advfirewall firewall add rule name="Python HabitoFlow" dir=in action=allow program="python.exe" enable=yes >nul 2>&1
if %errorlevel% equ 0 (
    echo OK: Regra criada para Python
) else (
    echo INFO: Nao foi possivel criar regra (pode precisar de admin)
)

echo.
echo ========================================
pause