Write-Host "Testando build do Android com Java 17..." -ForegroundColor Green
Write-Host ""

# Limpa o cache
Write-Host "1. Limpando cache do Gradle:" -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Write-Host ""

# Testa o build
Write-Host "2. Compilando o projeto:" -ForegroundColor Yellow
.\gradlew assembleDebug
Set-Location ..
Write-Host ""

# Executa o app
Write-Host "3. Iniciando o app no Android:" -ForegroundColor Yellow
npx react-native run-android