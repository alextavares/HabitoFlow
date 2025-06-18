Write-Host "Testando configuracao do Java..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verificando JAVA_HOME:" -ForegroundColor Yellow
Write-Host "JAVA_HOME = $env:JAVA_HOME"
Write-Host ""

Write-Host "2. Verificando versao do Java:" -ForegroundColor Yellow
java -version 2>&1 | Write-Host
Write-Host ""

Write-Host "3. Verificando versao do Javac:" -ForegroundColor Yellow
javac -version 2>&1 | Write-Host
Write-Host ""

Write-Host "4. Limpando cache do Gradle:" -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..
Write-Host ""

Write-Host "5. Testando build do Android:" -ForegroundColor Yellow
npx react-native run-android