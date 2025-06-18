Write-Host "Limpando e executando o projeto Android..." -ForegroundColor Green

# Limpa cache do Gradle
Write-Host "`n1. Limpando cache do Gradle..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..

# Executa o projeto
Write-Host "`n2. Executando no Android..." -ForegroundColor Yellow
npm run android