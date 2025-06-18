# 🚀 Rodar HabitoFlow no Android

## Opção 1: Dispositivo Físico (Mais Rápido)

### 1️⃣ Preparar o Celular
1. **Ativar Modo Desenvolvedor**:
   - Vá em Configurações > Sobre o telefone
   - Toque 7 vezes em "Número da versão"
   
2. **Ativar Depuração USB**:
   - Configurações > Opções do desenvolvedor
   - Ative "Depuração USB"
   
3. **Conectar via USB**:
   - Use um cabo USB
   - Aceite a autorização no celular

### 2️⃣ Verificar Conexão
```bash
adb devices
```
Deve aparecer algo como:
```
List of devices attached
XXXXX    device
```

### 3️⃣ Rodar o App
```bash
npm run android
```

---

## Opção 2: Android Studio Emulador

### 1️⃣ Instalar Android Studio
1. Download: https://developer.android.com/studio
2. Durante instalação, marque:
   - Android SDK
   - Android Virtual Device

### 2️⃣ Criar Emulador
1. Abra Android Studio
2. Menu: Tools > AVD Manager
3. Create Virtual Device
4. Escolha: Pixel 4 ou similar
5. System Image: API 30 ou superior
6. Finish

### 3️⃣ Iniciar Emulador
1. No AVD Manager, clique em ▶️ Play
2. Aguarde o emulador iniciar

### 4️⃣ Rodar o App
```bash
npm run android
```

---

## Opção 3: Instalar APK Diretamente

### 1️⃣ Verificar se existe APK
Procure por: `HabitoFlow-Installer.apk`

### 2️⃣ Instalar via ADB
```bash
adb install HabitoFlow-Installer.apk
```

### 3️⃣ Ou enviar para o celular
- WhatsApp/Email/Google Drive
- Baixar e instalar

---

## 🛠️ Solução de Problemas

### ❌ "SDK location not found"
```bash
# Windows - Adicione ao arquivo local.properties:
sdk.dir=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk
```

### ❌ "No connected devices"
```bash
# Verificar ADB
adb kill-server
adb start-server
adb devices
```

### ❌ "Build failed"
```bash
cd android
.\gradlew clean
cd ..
npm run android
```

### ❌ "Metro bundler error"
```bash
# Terminal 1
npx react-native start --reset-cache

# Terminal 2
npm run android
```

---

## 📱 Comandos Úteis

```bash
# Ver logs do app
adb logcat | findstr HabitoFlow

# Instalar em dispositivo específico
adb -s DEVICE_ID install app.apk

# Desinstalar app
adb uninstall com.habitoflow

# Recarregar app (com Metro rodando)
adb shell input keyevent 82  # Abre menu
# Selecione "Reload"
```

---

## 🎯 Dica Rápida

**Sem Android Studio?** Use o Expo:
```bash
npm install -g expo-cli
expo init HabitoFlowExpo
# Copie seu código
expo start
# Escaneie QR Code com Expo Go
```