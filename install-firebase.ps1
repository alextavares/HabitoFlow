Write-Host "Instalando dependencias do Firebase..." -ForegroundColor Green

# Para todos os processos
Write-Host "`n1. Parando processos..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Instala Firebase
Write-Host "`n2. Instalando Firebase..." -ForegroundColor Yellow
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Limpa e reconstroi Android
Write-Host "`n3. Reconstruindo projeto Android..." -ForegroundColor Yellow
Set-Location android
.\gradlew clean
Set-Location ..

# Inicia Metro com cache limpo em nova janela
Write-Host "`n4. Iniciando Metro..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npx react-native start --reset-cache"

# Aguarda
Start-Sleep -Seconds 10

# Executa Android em nova janela
Write-Host "`n5. Executando no Android..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run android"