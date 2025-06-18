Write-Host "=== VERIFICACAO COMPLETA DO AMBIENTE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Java
Write-Host "1. JAVA:" -ForegroundColor Yellow
Write-Host "   JAVA_HOME: $env:JAVA_HOME"
java -version 2>&1 | Out-String | Write-Host
Write-Host ""

# 2. Android SDK
Write-Host "2. ANDROID SDK:" -ForegroundColor Yellow
Write-Host "   ANDROID_HOME: $env:ANDROID_HOME"
$sdkPath = "C:\Users\Alexandre\AppData\Local\Android\Sdk"
if (Test-Path $sdkPath) {
    Write-Host "   SDK encontrado em: $sdkPath" -ForegroundColor Green
    
    # Verifica componentes essenciais
    $components = @{
        "platform-tools" = "Platform Tools"
        "build-tools" = "Build Tools"
        "platforms\android-35" = "Android 35 (API 35)"
        "emulator" = "Emulator"
    }
    
    foreach ($comp in $components.GetEnumerator()) {
        if (Test-Path "$sdkPath\$($comp.Key)") {
            Write-Host "   OK $($comp.Value)" -ForegroundColor Green
        } else {
            Write-Host "   X $($comp.Value) NAO ENCONTRADO" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   SDK NAO encontrado!" -ForegroundColor Red
}
Write-Host ""

# 3. Node/NPM
Write-Host "3. NODE/NPM:" -ForegroundColor Yellow
node --version | Write-Host
npm --version | Write-Host
Write-Host ""

# 4. Emulador/Dispositivo
Write-Host "4. DISPOSITIVOS ANDROID:" -ForegroundColor Yellow
if (Test-Path "$sdkPath\platform-tools\adb.exe") {
    & "$sdkPath\platform-tools\adb.exe" devices
} else {
    Write-Host "   ADB nao encontrado!" -ForegroundColor Red
}
Write-Host ""

# 5. Variaveis de ambiente necessarias
Write-Host "5. VARIAVEIS DE AMBIENTE:" -ForegroundColor Yellow
if ($env:ANDROID_HOME) {
    Write-Host "   OK ANDROID_HOME definida" -ForegroundColor Green
} else {
    Write-Host "   X ANDROID_HOME NAO definida" -ForegroundColor Red
    Write-Host "   Execute: setx ANDROID_HOME ""C:\Users\Alexandre\AppData\Local\Android\Sdk""" -ForegroundColor Yellow
}

# Verifica se platform-tools esta no PATH
$pathContainsPlatformTools = $env:PATH -like "*platform-tools*"
if ($pathContainsPlatformTools) {
    Write-Host "   OK platform-tools no PATH" -ForegroundColor Green
} else {
    Write-Host "   X platform-tools NAO esta no PATH" -ForegroundColor Red
}
Write-Host ""

# 6. Status do projeto
Write-Host "6. PROJETO:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   OK node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   X node_modules NAO existe - Execute: npm install" -ForegroundColor Red
}

if (Test-Path "android\local.properties") {
    Write-Host "   OK local.properties configurado" -ForegroundColor Green
} else {
    Write-Host "   X local.properties NAO existe" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ACOES RECOMENDADAS ===" -ForegroundColor Cyan
Write-Host "1. Se ANDROID_HOME nao esta definida:"
Write-Host "   setx ANDROID_HOME ""C:\Users\Alexandre\AppData\Local\Android\Sdk"""
Write-Host ""
Write-Host "2. Se faltam componentes do SDK, abra o Android Studio e instale:"
Write-Host "   - Android SDK Platform 35"
Write-Host "   - Android SDK Build-Tools"
Write-Host "   - Android Emulator"
Write-Host ""
Write-Host "3. Para iniciar um emulador ou conectar dispositivo:"
Write-Host "   - Abra o Android Studio > AVD Manager"
Write-Host "   - Ou conecte um dispositivo Android com USB debugging ativado"