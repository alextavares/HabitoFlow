Write-Host "Procurando Android SDK..." -ForegroundColor Cyan
Write-Host ""

# Verifica ANDROID_HOME
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Yellow

# Procura em locais comuns
$androidLocations = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "C:\Program Files\Android\android-sdk",
    "C:\Program Files (x86)\Android\android-sdk"
)

Write-Host "`nProcurando em locais comuns:" -ForegroundColor Yellow
foreach ($location in $androidLocations) {
    if (Test-Path $location) {
        Write-Host "Encontrado: $location" -ForegroundColor Green
        
        # Verifica subpastas importantes
        $subfolders = @("platform-tools", "platforms", "build-tools")
        foreach ($subfolder in $subfolders) {
            if (Test-Path "$location\$subfolder") {
                Write-Host "  ✓ $subfolder" -ForegroundColor DarkGreen
            }
        }
    }
}

# Se não encontrar, sugere instalação
if (-not $env:ANDROID_HOME) {
    Write-Host "`nAndroid SDK nao encontrado!" -ForegroundColor Red
    Write-Host "Instale o Android Studio ou o Android SDK Command-line Tools" -ForegroundColor Yellow
}