# Guia para Rodar e Testar o HabitoFlow

## 🔧 Pré-requisitos

### Ambiente de Desenvolvimento
- **Node.js**: versão 18 ou superior
- **Java JDK**: versão 17 (já configurado)
- **Android Studio**: com Android SDK
- **Git**: para controle de versão

### Verificar instalações:
```bash
# Verificar Node.js
node --version  # Deve mostrar v18.x.x ou superior

# Verificar npm
npm --version

# Verificar Java
java -version  # Deve mostrar versão 17

# Verificar Android SDK
echo %ANDROID_HOME%  # Windows
```

## 📦 Instalação de Dependências

### 1. Instalar dependências do Node.js
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
npm install
```

### 2. Instalar CocoaPods (iOS - opcional)
```bash
# Apenas se for desenvolver para iOS
cd ios && pod install
```

## 🤖 Configurar Emulador Android

### No Android Studio:
1. Abra o **AVD Manager** (Android Virtual Device)
2. Clique em **Create Virtual Device**
3. Escolha um dispositivo (recomendado: Pixel 4)
4. Selecione uma imagem do sistema:
   - **Recomendado**: Android 13 (API 33)
   - **Mínimo**: Android 6 (API 23)
5. Finalize a criação e inicie o emulador

### Verificar se o emulador está rodando:
```bash
adb devices
# Deve mostrar algo como:
# List of devices attached
# emulator-5554   device
```

## 🚀 Executar o App

### 1. Iniciar o Metro Bundler
Em um terminal:
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
npm start
# ou
npx react-native start
```

### 2. Executar no Android
Em outro terminal:
```bash
cd C:\codigos\pesquisarpp\HabitoFlow
npm run android
# ou
npx react-native run-android
```

### 3. Se houver problemas, limpe o cache:
```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Limpar build do Android
cd android
gradlew clean
cd ..

# Reinstalar
npm run android
```

## 🧪 Roteiro de Testes

### 1. Tela de Login
- [ ] App abre sem crashes
- [ ] Splash screen aparece
- [ ] Botão "Entrar com Google" funciona
- [ ] Login redireciona para tela principal

### 2. Tela Principal (Hábitos)
- [ ] Lista de hábitos aparece vazia inicialmente
- [ ] Botão "+" abre modal de adicionar hábito
- [ ] É possível criar um novo hábito:
  - Nome do hábito
  - Selecionar ícone
  - Escolher cor
  - Definir horário de lembrete
- [ ] Hábito aparece na lista após criação
- [ ] Checkbox marca/desmarca hábito
- [ ] Animação de confetti ao completar
- [ ] Swipe para esquerda mostra opção de deletar
- [ ] Toque longo abre calendário do hábito

### 3. Navegação Bottom Tabs
- [ ] Tab "Hábitos" está selecionada por padrão
- [ ] Tab "Estatísticas" mostra gráficos
- [ ] Tab "Conquistas" mostra gamificação
- [ ] Tab "Perfil" mostra informações do usuário

### 4. Tela de Estatísticas
- [ ] Cards superiores mostram:
  - Dias de sequência
  - Total de hábitos
  - Completados hoje
- [ ] Gráfico semanal exibe dados
- [ ] Lista de hábitos com percentual

### 5. Tela de Conquistas
- [ ] Mostra nível e pontos do usuário
- [ ] Lista conquistas bloqueadas/desbloqueadas
- [ ] Tabs "Todas" e "Desbloqueadas" funcionam

### 6. Tela de Perfil
- [ ] Informações do usuário aparecem
- [ ] Toggle de tema escuro funciona
- [ ] Toggle de notificações funciona
- [ ] Botão "Sair" faz logout
- [ ] Opção "Excluir conta" mostra confirmação

### 7. Funcionalidades Específicas
- [ ] **Tema Escuro**: Alterna entre claro/escuro
- [ ] **Notificações**: Pede permissão ao ativar
- [ ] **Persistência**: Dados salvos após fechar app
- [ ] **Offline**: App funciona sem internet
- [ ] **Orientação**: App mantém retrato

## 🐛 Problemas Comuns e Soluções

### Erro: "Unable to load script from assets 'index.android.bundle'"
```bash
# Criar a pasta assets
mkdir android\app\src\main\assets

# Gerar o bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### Erro: "Could not connect to development server"
```bash
# Configurar IP do Metro no emulador
adb reverse tcp:8081 tcp:8081
```

### Erro: "Execution failed for task ':app:installDebug'"
```bash
# Desinstalar versão anterior
adb uninstall com.habitoflow

# Tentar novamente
npm run android
```

### Erro de dependências nativas
```bash
# Relinkar bibliotecas nativas
cd android
gradlew clean
cd ..
npx react-native run-android
```

## 📱 Testar em Dispositivo Físico

### 1. Habilitar modo desenvolvedor no celular:
- Configurações > Sobre o telefone
- Tocar 7 vezes em "Número da versão"

### 2. Habilitar depuração USB:
- Configurações > Opções do desenvolvedor
- Ativar "Depuração USB"

### 3. Conectar e verificar:
```bash
adb devices
# Deve aparecer seu dispositivo
```

### 4. Executar no dispositivo:
```bash
npm run android
```

## 🎮 Dados de Teste

### Para testar completamente, crie:
1. **Hábitos variados**:
   - "💧 Beber 2L de água"
   - "🏃 Exercitar 30min"
   - "📚 Ler 20 páginas"
   - "🧘 Meditar 10min"
   - "💤 Dormir 8 horas"

2. **Complete alguns hábitos** para ver:
   - Animação de confetti
   - Atualização de streak
   - Desbloqueio de conquistas

3. **Use por alguns dias** para testar:
   - Notificações de lembrete
   - Gráficos de estatísticas
   - Sistema de pontos

## 🔍 Checklist de Qualidade

### Performance
- [ ] App abre em menos de 3 segundos
- [ ] Transições suaves entre telas
- [ ] Sem travamentos ao criar/deletar hábitos
- [ ] Lista rola suavemente com muitos itens

### Usabilidade
- [ ] Todos os botões respondem ao toque
- [ ] Feedback visual em todas as ações
- [ ] Mensagens de erro claras
- [ ] Loading states onde necessário

### Visual
- [ ] Cores consistentes com o tema
- [ ] Ícones e fontes legíveis
- [ ] Layout responsivo
- [ ] Sem elementos cortados

## 📊 Monitoramento

### Durante os testes, observe:
1. **Logcat** (Android Studio) para erros
2. **Metro Bundler** terminal para warnings
3. **Performance** no profiler do React Native
4. **Memória** usage no Android Studio

### Comandos úteis:
```bash
# Ver logs do Android
adb logcat | grep -i habitoflow

# Ver logs do React Native
npx react-native log-android

# Shake no emulador para debug menu
# Ctrl + M (Windows) ou Cmd + M (Mac)
```

## ✅ Pronto para Produção?

Quando todos os testes passarem:
1. Gere um APK de release
2. Teste o APK em dispositivo real
3. Verifique performance final
4. Documente bugs conhecidos
5. Prepare para publicação

---

**Dica**: Mantenha o Metro Bundler e o emulador abertos durante o desenvolvimento para hot reload automático!