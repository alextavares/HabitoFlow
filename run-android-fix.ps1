Write-Host "Corrigindo e executando o Android..." -ForegroundColor Green

# Limpa caches
Write-Host "`n1. Limpando caches..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
}

# Reinstala dependências
Write-Host "`n2. Reinstalando dependencias..." -ForegroundColor Yellow
npm install

# Limpa cache do Gradle
Write-Host "`n3. Limpando cache do Gradle..." -ForegroundColor Yellow
Set-Location android
if (Test-Path ".gradle") {
    Remove-Item -Recurse -Force .gradle
}
.\gradlew clean
Set-Location ..

# Executa o Android
Write-Host "`n4. Executando no Android..." -ForegroundColor Yellow
npm run android