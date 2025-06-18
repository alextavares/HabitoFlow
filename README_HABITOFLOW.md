# HabitoFlow - App de Rastreamento de Hábitos 🎯

Um aplicativo moderno para rastreamento de hábitos com design glassmorphism, dark mode e integração com Firebase.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- Android Studio com emulador configurado
- React Native CLI

### ⚠️ Instalação de Dependências Pendentes

Devido a problemas temporários com npm, você precisa instalar manualmente alguns pacotes:

```bash
# Limpe o cache do npm primeiro
npm cache clean --force

# Instale os pacotes necessários
npm install react-native-linear-gradient
npm install @react-native-async-storage/async-storage
npm install react-native-canvas
```

## 🔥 Firebase já está Configurado!

O Firebase já está integrado com:
- ✅ Autenticação (Email/Senha)
- ✅ Firestore Database
- ✅ google-services.json configurado

## 📱 Funcionalidades Implementadas

1. **Tela de Login/Cadastro com Firebase**
   - Login com email/senha
   - Cadastro de novos usuários
   - Recuperação de senha
   - Mensagens de erro em português

2. **Tela Principal (Home)**
   - Lista de hábitos com progresso
   - Dark mode funcional
   - Animações de confetti
   - Logout integrado

3. **Tela de Adicionar Hábito**
   - Seleção de emoji e cor
   - Preview em tempo real
   - Configuração de frequência

4. **Design System**
   - Glassmorphism
   - Gradientes modernos
   - Micro-animações
   - Tema claro/escuro

## 🏃 Executando o App

### 1. Inicie o Metro bundler:
```bash
npm start
```

### 2. Em outro terminal, execute o app Android:
```bash
npm run android
```

## 🎨 Arquitetura do Projeto

```
src/
├── screens/
│   ├── LoginScreenFirebase.tsx    # Tela de login
│   ├── HomeScreenV3.tsx           # Tela principal
│   └── AddHabitScreen.tsx         # Tela de adicionar hábito
├── services/
│   └── firebase.ts                # Serviços Firebase
├── contexts/
│   └── ThemeContext.tsx           # Contexto de tema
├── components/
│   └── ConfettiCelebration.tsx    # Animação de confetti
└── mocks/                         # Mocks temporários
```

## ⚠️ Importante sobre os Mocks

Os arquivos em `src/mocks/` são temporários! Após instalar os pacotes reais:
1. Delete a pasta `src/mocks/`
2. Remova os comentários `@ts-ignore` dos imports
3. Substitua os imports dos mocks pelos pacotes reais:
   - `../mocks/react-native-linear-gradient` → `react-native-linear-gradient`
   - `../mocks/async-storage` → `@react-native-async-storage/async-storage`

## 🔄 Próximos Passos

1. **Instalar pacotes pendentes** (veja MISSING_PACKAGES.md)
2. **Testar autenticação** - Crie uma conta e faça login
3. **Implementar CRUD de hábitos** - Conectar com Firestore
4. **Adicionar navegação** - React Navigation entre telas
5. **Notificações push** - Lembretes de hábitos
6. **Monetização** - Implementar funcionalidades premium

## 💡 Dicas de Desenvolvimento

### Recarregar o App
- **Android**: Pressione <kbd>R</kbd> duas vezes ou <kbd>Ctrl</kbd> + <kbd>M</kbd> → "Reload"
- **Metro Bundler**: Pressione <kbd>r</kbd> no terminal

### Debug
- **React DevTools**: <kbd>Ctrl</kbd> + <kbd>M</kbd> → "Debug"
- **Console logs**: Aparecem no terminal do Metro

### Firebase Console
- Acesse: https://console.firebase.google.com
- Projeto: habitoflow-app

## 🐛 Resolução de Problemas

### Erro de instalação de pacotes
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### Erro de build Android
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Firebase não conecta
- Verifique se o google-services.json está em `android/app/`
- Confirme que o package name é `com.habitoflow`

## 📚 Recursos Úteis

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Firebase React Native](https://rnfirebase.io/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Elements](https://reactnativeelements.com/)