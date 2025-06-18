# 🚀 Configuração Android - HabitoFlow

## ⚠️ Problemas Identificados

O `npx react-native doctor` mostrou que precisa configurar:

### 1. JDK (Java Development Kit)
- **Versão necessária:** >= 17 <= 20
- **Download:** https://adoptium.net/
- Instale o OpenJDK 17 ou 18

### 2. Android Studio
- **Download:** https://developer.android.com/studio
- Durante a instalação, certifique-se de instalar:
  - Android SDK
  - Android SDK Platform-Tools
  - Android Emulator

### 3. Variáveis de Ambiente

Adicione ao seu sistema (Windows):

```bash
# Abra o PowerShell como administrador e execute:
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

### 4. Android SDK
- Abra Android Studio
- Vá em **Tools → SDK Manager**
- Instale **Android 14 (API 34)** ou superior

### 5. Emulador Android
- No Android Studio: **Tools → AVD Manager**
- Crie um novo dispositivo virtual
- Escolha um Pixel ou Galaxy recente
- Inicie o emulador

## 🔄 Após Configurar

1. **Reinicie o terminal/PowerShell**
2. **Verifique a configuração:**
```bash
npx @react-native-community/cli doctor
```

3. **Execute o app:**
```bash
npm start
# Em outro terminal:
npm run android
```

## 📱 Alternativa: Dispositivo Físico

Se preferir testar em dispositivo real:

1. **Ative o modo desenvolvedor** no Android
2. **Ative depuração USB**
3. **Conecte via USB**
4. **Execute:** `adb devices` para verificar conexão

## ✅ Status Atual do App

O código está 100% pronto:
- ✅ Firebase configurado
- ✅ Pacotes instalados  
- ✅ Autenticação implementada
- ✅ UI completa com glassmorphism

Só falta configurar o ambiente Android! 🎯