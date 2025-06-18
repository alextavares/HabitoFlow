# Script para instalar Java 17 no Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instalador do Java 17 para HabitoFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "AVISO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host "Por favor, abra o PowerShell como Administrador e execute novamente." -ForegroundColor Yellow
    exit 1
}

# Verificar se o Chocolatey está instalado
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoInstalled) {
    Write-Host "Chocolatey não encontrado. Instalando..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Recarregar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host ""
Write-Host "Instalando Java 17 (OpenJDK)..." -ForegroundColor Green
choco install openjdk17 -y

# Configurar JAVA_HOME
Write-Host ""
Write-Host "Configurando JAVA_HOME..." -ForegroundColor Green
$javaPath = "C:\Program Files\OpenJDK\openjdk-17"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, [EnvironmentVariableTarget]::Machine)
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, [EnvironmentVariableTarget]::User)

# Atualizar PATH
$machinePath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
if ($machinePath -notlike "*$javaPath\bin*") {
    [Environment]::SetEnvironmentVariable("Path", "$machinePath;$javaPath\bin", [EnvironmentVariableTarget]::Machine)
}

# Recarregar variáveis de ambiente
$env:JAVA_HOME = $javaPath
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Java 17 instalado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar instalação
Write-Host "Verificando instalação..." -ForegroundColor Cyan
java -version

Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Feche e reabra o terminal/VS Code para carregar as novas variáveis" -ForegroundColor White
Write-Host "2. Execute 'java -version' para confirmar que está usando Java 17" -ForegroundColor White
Write-Host "3. Execute 'npm install' novamente no projeto" -ForegroundColor White
Write-Host ""