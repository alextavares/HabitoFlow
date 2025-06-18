# Script para instalar Android SDK Tools
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instalador Android SDK Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Chocolatey está instalado
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoInstalled) {
    Write-Host "Erro: Chocolatey não está instalado!" -ForegroundColor Red
    Write-Host "Execute primeiro o install-java17.ps1 como Administrador" -ForegroundColor Yellow
    exit 1
}

Write-Host "Instalando Android SDK Command-line Tools..." -ForegroundColor Green
choco install android-sdk -y

Write-Host ""
Write-Host "Configurando variáveis de ambiente..." -ForegroundColor Green

# Configurar ANDROID_HOME
$androidPath = "C:\Android\android-sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidPath, [EnvironmentVariableTarget]::User)
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidPath, [EnvironmentVariableTarget]::User)

# Atualizar PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
$pathsToAdd = @(
    "$androidPath\platform-tools",
    "$androidPath\tools",
    "$androidPath\tools\bin",
    "$androidPath\emulator"
)

foreach ($path in $pathsToAdd) {
    if ($userPath -notlike "*$path*") {
        $userPath = "$userPath;$path"
    }
}

[Environment]::SetEnvironmentVariable("Path", $userPath, [EnvironmentVariableTarget]::User)

# Recarregar variáveis
$env:ANDROID_HOME = $androidPath
$env:ANDROID_SDK_ROOT = $androidPath
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Android SDK Tools instalado!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Feche e reabra o terminal" -ForegroundColor White
Write-Host "2. Execute: adb devices" -ForegroundColor White
Write-Host "3. Se precisar de um emulador, instale o Android Studio" -ForegroundColor White
Write-Host ""