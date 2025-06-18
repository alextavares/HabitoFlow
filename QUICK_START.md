# 🚀 Guia Rápido - HabitoFlow

## Passo a Passo Simples

### 1️⃣ Abra o Android Studio
- Inicie um emulador (AVD Manager → ▶️ Play)
- Aguarde o Android carregar completamente

### 2️⃣ Abra 2 terminais PowerShell

**Terminal 1 - Metro Bundler:**
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
npm start
```
Aguarde aparecer: "Loading dependency graph, done."

**Terminal 2 - Executar App:**
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
adb reverse tcp:8081 tcp:8081
npm run android
```

### 3️⃣ Aguarde
- A primeira compilação demora 3-5 minutos
- O app abrirá automaticamente no emulador

## 🔧 Se der erro:

### "Unable to load script"
No Terminal 2, execute:
```bash
adb reverse tcp:8081 tcp:8081
```

### "Could not connect to development server"
1. Verifique se o Metro está rodando no Terminal 1
2. No emulador: Settings → System → Advanced → Developer options
3. Ative: "USB debugging"

### App travou ou tela branca
- No emulador: Ctrl+M → Reload
- Ou feche e abra o app novamente

## ✅ Testes Básicos

1. **Login**: Clique em "Entrar com Google"
2. **Criar Hábito**: Toque no botão "+"
3. **Marcar Completo**: Toque no checkbox
4. **Ver Estatísticas**: Navegue pelas abas

## 🎯 Método Alternativo

Se nada funcionar, use o script:
```bash
C:\codigos\pesquisarpp\HabitoFlow\run-dev.bat
```

---

**Dica**: Mantenha os dois terminais abertos durante o desenvolvimento!