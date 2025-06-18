# Script para gerar APK
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gerando APK do HabitoFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Entrar na pasta android
Set-Location android

# Limpar build anterior
Write-Host "Limpando build anterior..." -ForegroundColor Yellow
.\gradlew clean

# Gerar APK de debug
Write-Host ""
Write-Host "Gerando APK..." -ForegroundColor Yellow
.\gradlew assembleDebug

# Verificar se foi gerado
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    Write-Host ""
    Write-Host "APK gerado com sucesso!" -ForegroundColor Green
    Write-Host "Localização: $pwd\$apkPath" -ForegroundColor White
    
    # Copiar para pasta principal
    Copy-Item $apkPath "..\HabitoFlow-Debug.apk"
    Write-Host "Copiado para: HabitoFlow-Debug.apk" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Para instalar no celular:" -ForegroundColor Cyan
    Write-Host "1. Envie o arquivo HabitoFlow-Debug.apk para o celular" -ForegroundColor White
    Write-Host "2. Ative 'Fontes desconhecidas' nas configurações" -ForegroundColor White
    Write-Host "3. Instale o APK" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Erro ao gerar APK!" -ForegroundColor Red
}

# Voltar para pasta principal
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan