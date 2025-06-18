Write-Host "Reconstruindo projeto Android com Firebase..." -ForegroundColor Green

# Para todos os processos
Write-Host "`n1. Parando processos..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpa completamente o Android
Write-Host "`n2. Limpando build Android..." -ForegroundColor Yellow
Set-Location android
if (Test-Path "app\build") {
    Remove-Item -Recurse -Force "app\build"
}
if (Test-Path ".gradle") {
    Remove-Item -Recurse -Force ".gradle"
}
.\gradlew clean
Set-Location ..

# Limpa cache do npm
Write-Host "`n3. Limpando cache NPM..." -ForegroundColor Yellow
npm cache clean --force

# Reinstala node_modules
Write-Host "`n4. Reinstalando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
npm install

# Inicia Metro
Write-Host "`n5. Iniciando Metro..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npx react-native start --reset-cache"

# Aguarda
Start-Sleep -Seconds 15

# Executa Android
Write-Host "`n6. Executando no Android..." -ForegroundColor Yellow
npm run android