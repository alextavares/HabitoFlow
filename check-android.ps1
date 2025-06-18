Write-Host "Verificando Android SDK..." -ForegroundColor Cyan

# Locais comuns do SDK
$locations = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

foreach ($path in $locations) {
    if (Test-Path $path) {
        Write-Host "Android SDK encontrado em: $path" -ForegroundColor Green
        break
    }
}

Write-Host "`nVariavel ANDROID_HOME: $env:ANDROID_HOME"