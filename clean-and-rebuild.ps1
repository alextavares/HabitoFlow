# Script de limpeza completa e reconstrução do HabitoFlow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Limpeza Completa do Projeto HabitoFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar versão do Java
Write-Host "Verificando versão do Java..." -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
Write-Host $javaVersion -ForegroundColor Green

if ($javaVersion -notlike "*17*" -and $javaVersion -notlike "*18*" -and $javaVersion -notlike "*19*" -and $javaVersion -notlike "*20*" -and $javaVersion -notlike "*21*") {
    Write-Host ""
    Write-Host "ERRO: Java 17 ou superior não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\install-java17.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Parando processos Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process "React Native" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "2. Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "3. Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
}

Write-Host "4. Removendo package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
}

Write-Host "5. Limpando cache do Metro..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Path "$env:TEMP\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "6. Limpando build do Android..." -ForegroundColor Yellow
Set-Location android
if (Test-Path ".gradle") {
    Remove-Item -Path ".gradle" -Recurse -Force
}
if (Test-Path "app\build") {
    Remove-Item -Path "app\build" -Recurse -Force
}

# Limpar cache do Gradle
Write-Host "7. Limpando cache do Gradle..." -ForegroundColor Yellow
.\gradlew.bat clean --no-daemon

# Limpar cache do Kotlin
Write-Host "8. Limpando cache do Kotlin..." -ForegroundColor Yellow
if (Test-Path ".kotlin") {
    Remove-Item -Path ".kotlin" -Recurse -Force
}
if (Test-Path "$env:USERPROFILE\.gradle\kotlin") {
    Remove-Item -Path "$env:USERPROFILE\.gradle\kotlin" -Recurse -Force -ErrorAction SilentlyContinue
}

Set-Location ..

Write-Host ""
Write-Host "9. Reinstalando dependências..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Limpeza completa realizada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: npm run android" -ForegroundColor White
Write-Host "2. Se houver erros, execute: .\run-android-fix.ps1" -ForegroundColor White
Write-Host ""