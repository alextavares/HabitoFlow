# 🔧 Resolução de Problemas - HabitoFlow

## 📋 Problemas Identificados e Soluções

### 1. ❌ **Java 8 Desatualizado**
**Problema**: React Native 0.79.3 requer Java 17+, mas o sistema está usando Java 8.

**Solução**:
```powershell
# Execute como Administrador
.\install-java17.ps1
```

### 2. ✅ **Incompatibilidade React vs React-DOM** 
**Problema**: React 19.0.0 com React-DOM 18.3.1 causava conflitos.

**Status**: ✅ RESOLVIDO - Ambos agora estão na versão 18.3.1

### 3. ❌ **Erros do Kotlin Daemon**
**Problema**: Kotlin daemon terminando inesperadamente durante build.

**Solução**:
```powershell
# Limpar caches do Kotlin
.\clean-and-rebuild.ps1
```

### 4. ❌ **Caches Corrompidos**
**Problema**: Gradle, Metro e npm com caches corrompidos.

**Solução**:
```powershell
# Limpeza completa
.\clean-and-rebuild.ps1
```

## 🚀 Passos para Resolver Todos os Problemas

### Passo 1: Instalar Java 17
```powershell
# Abrir PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install-java17.ps1
```

### Passo 2: Fechar e Reabrir Terminal
Importante para carregar as novas variáveis de ambiente.

### Passo 3: Verificar Java
```powershell
java -version
# Deve mostrar: openjdk version "17.x.x"
```

### Passo 4: Limpar e Reconstruir
```powershell
.\clean-and-rebuild.ps1
```

### Passo 5: Executar o App
```powershell
npm run android
```

## 🛠️ Scripts Disponíveis

1. **install-java17.ps1** - Instala Java 17 automaticamente
2. **clean-and-rebuild.ps1** - Limpa todos os caches e reconstrói
3. **run-android-fix.ps1** - Executa com correções específicas
4. **fix-metro.ps1** - Corrige problemas do Metro bundler

## ⚡ Comandos Rápidos

```powershell
# Se o Metro travar
Get-Process node | Stop-Process -Force
npm start --reset-cache

# Se o Gradle falhar
cd android
.\gradlew.bat clean
cd ..

# Se as dependências estiverem corrompidas
rm -rf node_modules
rm package-lock.json
npm install
```

## 📱 Testando no Dispositivo

1. Conecte o dispositivo Android via USB
2. Ative o Modo Desenvolvedor
3. Execute:
```powershell
adb devices  # Verificar se o dispositivo está conectado
npm run android
```

## ✅ Checklist de Verificação

- [ ] Java 17+ instalado
- [ ] JAVA_HOME configurado corretamente
- [ ] node_modules limpo e reinstalado
- [ ] Gradle cache limpo
- [ ] Metro cache limpo
- [ ] Dispositivo Android conectado (se aplicável)

## 🆘 Se Ainda Houver Problemas

1. Verifique o log completo: `adb logcat > error.log`
2. Procure por erros específicos no arquivo
3. Tente executar: `npx react-native doctor`
4. Última opção: Clone o projeto novamente e siga os passos acima

---

**Última atualização**: Janeiro 2025