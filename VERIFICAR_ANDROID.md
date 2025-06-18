# ✅ Verificação Android Studio - HabitoFlow

## 🔍 Passos para Verificar/Configurar

### 1. Verificar JDK no Windows

Abra o **PowerShell/CMD** e execute:
```cmd
java -version
javac -version
```

Se não aparecer Java 17/18, instale: https://adoptium.net/

### 2. Verificar Android SDK

No **Android Studio**:
1. Abra **File → Settings** (ou **Android Studio → Preferences** no Mac)
2. Vá em **Appearance & Behavior → System Settings → Android SDK**
3. Verifique se tem **Android 14 (API 34)** ou **Android 13 (API 33)** instalado
4. Na aba **SDK Tools**, certifique-se que está marcado:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Tools

### 3. Configurar Variáveis de Ambiente (Windows)

Abra **PowerShell como Administrador** e execute:

```powershell
# Verificar se ANDROID_HOME já existe
echo $env:ANDROID_HOME

# Se não existir, configurar (substitua SEU_USUARIO pelo seu nome de usuário)
setx ANDROID_HOME "C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk"

# Adicionar ao PATH
setx PATH "$env:PATH;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"
```

**OU** configure manualmente:
1. **Windows + R** → digite `sysdm.cpl`
2. **Avançado** → **Variáveis de Ambiente**
3. **Nova** variável do sistema:
   - Nome: `ANDROID_HOME`
   - Valor: `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`
4. Edite o **PATH** e adicione:
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\platform-tools`

### 4. Criar/Iniciar Emulador

No **Android Studio**:
1. **Tools → AVD Manager**
2. **Create Virtual Device**
3. Escolha **Pixel 6** ou **Pixel 7**
4. Escolha **Android 14** ou **Android 13**
5. **Finish** e clique no ▶️ para iniciar

### 5. Verificar Configuração

**Reinicie o PowerShell** e execute:
```cmd
adb devices
npx @react-native-community/cli doctor
```

### 6. Executar o HabitoFlow

Se tudo estiver ✅:
```bash
npm start
# Em outro terminal:
npm run android
```

## 🎯 Resultado Esperado

Você verá o HabitoFlow rodando com:
- Tela de login linda com gradientes
- Firebase funcionando
- Possibilidade de criar conta e fazer login
- Dark mode toggle
- Animações suaves

## ⚡ Atalho Rápido

Se você tem emulador rodando e PATH configurado:
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
npm run android
```

Teste e me informe o resultado! 🚀