# 🚀 HabitoFlow - Android Quick Start

## Opção 1: Instalar APK Pronto
Se você tem o arquivo `HabitoFlow-Installer.apk`:
1. Copie o APK para seu celular
2. Ative "Fontes desconhecidas" nas configurações
3. Instale o APK

## Opção 2: Compilar e Instalar

### Pré-requisitos:
- ✅ Java 17 (já instalado)
- ✅ Node.js (já instalado)
- ❌ Android Studio ou SDK Tools
- 📱 Dispositivo Android com USB Debug ativado

### Passos:

1. **Instalar Android Studio**
   - Download: https://developer.android.com/studio
   - Durante instalação, marque "Android SDK" e "Android Virtual Device"

2. **Ou instalar apenas SDK Tools** (mais leve):
   ```bash
   # No PowerShell como Admin
   choco install android-sdk -y
   ```

3. **Conectar dispositivo**:
   - Ative modo desenvolvedor no Android
   - Ative depuração USB
   - Conecte via USB
   - Execute: `adb devices`

4. **Compilar e instalar**:
   ```bash
   npm run android
   ```

## Opção 3: Usar Emulador

1. Abra Android Studio
2. AVD Manager > Create Virtual Device
3. Escolha um dispositivo (ex: Pixel 4)
4. Baixe uma imagem do sistema (ex: Android 11)
5. Inicie o emulador
6. Execute: `npm run android`

## Solução de Problemas

**Erro: SDK not found**
```bash
# Windows
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools

# Ou adicione às variáveis de ambiente do sistema
```

**Erro: Device not found**
```bash
adb devices  # Verificar se aparece
adb kill-server
adb start-server
```

**Erro: Build failed**
```bash
cd android
.\gradlew clean
cd ..
npm run android
```