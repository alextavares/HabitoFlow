# 🚨 Configuração Completa do Ambiente - HabitoFlow

## ❌ Problemas Encontrados:

1. **Java 8 ainda instalado** (precisa Java 17)
2. **ADB não reconhecido** (Android SDK não está no PATH)
3. **Dependências corrompidas**

## 🔧 Solução Passo a Passo:

### 1️⃣ Atualizar Java para versão 17

**Baixe e instale:**
- Link: https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.exe
- **OU** https://adoptium.net/temurin/releases/ (escolha JDK 17 LTS)

**Durante instalação:**
- ✅ Marque "Set JAVA_HOME variable"
- ✅ Marque "Add to PATH"

**Após instalar:**
1. Feche e abra o PowerShell
2. Execute: `java -version`
3. Deve mostrar: `java version "17.0.x"`

### 2️⃣ Configurar Android SDK PATH

**No Android Studio:**
1. Abra Android Studio
2. File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Copie o caminho do SDK (geralmente `C:\Users\Alexandre\AppData\Local\Android\Sdk`)

**Adicionar ao PATH do Windows:**
1. Windows + R → `sysdm.cpl` → OK
2. Aba "Avançado" → "Variáveis de Ambiente"
3. Em "Variáveis do Sistema", encontre PATH e clique "Editar"
4. Adicione estas linhas:
   ```
   C:\Users\Alexandre\AppData\Local\Android\Sdk\platform-tools
   C:\Users\Alexandre\AppData\Local\Android\Sdk\tools
   C:\Users\Alexandre\AppData\Local\Android\Sdk\emulator
   ```
5. OK em todas as janelas

**Verificar:**
1. Feche e abra o PowerShell
2. Execute: `adb --version`
3. Deve mostrar a versão do ADB

### 3️⃣ Iniciar Emulador Android

**No Android Studio:**
1. Tools → AVD Manager
2. Clique no ▶️ para iniciar um emulador
3. Aguarde carregar completamente

**Verificar:**
```cmd
adb devices
```
Deve listar o emulador

### 4️⃣ Executar HabitoFlow

**Opção A - Usar o script de correção:**
```cmd
cd C:\codigos\pesquisarpp\HabitoFlow
.\fix-and-run.bat
```

**Opção B - Comandos manuais:**
```cmd
cd C:\codigos\pesquisarpp\HabitoFlow
rmdir /s /q node_modules
del package-lock.json
npm install
npx react-native@0.79.3 run-android
```

## ✅ Checklist Final:

- [ ] Java 17 instalado (`java -version` mostra 17.x.x)
- [ ] ADB funcionando (`adb --version` mostra versão)
- [ ] Emulador Android rodando (`adb devices` lista dispositivo)
- [ ] node_modules limpo e reinstalado

## 🎯 Resultado Esperado:

Quando tudo estiver configurado:
1. Build do Android vai iniciar
2. App será instalado no emulador
3. HabitoFlow abrirá com a linda tela de login
4. Firebase funcionando perfeitamente

## 💡 Dica:

Se após todas essas configurações ainda der erro, execute:
```cmd
npx create-react-native-app teste
cd teste
npm run android
```

Se o app teste funcionar, sabemos que o ambiente está OK e o problema é só nas dependências do HabitoFlow.

---

**Execute o `fix-and-run.bat` após configurar Java 17 e o PATH do Android!** 🚀