Write-Host "Corrigindo erro do Metro bundler..." -ForegroundColor Green

# Para todos os processos node
Write-Host "`n1. Parando processos Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpa cache do Metro
Write-Host "`n2. Limpando cache do Metro..." -ForegroundColor Yellow
npx react-native start --reset-cache &

# Aguarda o Metro iniciar
Write-Host "`n3. Aguardando Metro iniciar (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Em nova janela, executa o Android
Write-Host "`n4. Iniciando app no Android..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run android"