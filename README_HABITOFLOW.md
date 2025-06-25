# HabitoFlow - App de Rastreamento de Hábitos 🎯

Um aplicativo moderno para rastreamento de hábitos com design glassmorphism, dark mode e integração com Firebase.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- Android Studio com emulador configurado
- React Native CLI

## 🔥 Firebase Integrado
- ✅ Autenticação (Email/Senha, Google Sign-In)
- ✅ Firestore Database para persistência de dados do usuário, hábitos, logs, pontos e conquistas.
- ✅ `google-services.json` (Android) e `GoogleService-Info.plist` (iOS) devem ser configurados.

## 📱 Funcionalidades Implementadas

1.  **Autenticação Completa:**
    *   Login e Cadastro com Email/Senha.
    *   Login com Google.
    *   Recuperação de senha.
    *   Exclusão de conta.

2.  **Gerenciamento de Hábitos (`HomeScreenV3`):**
    *   CRUD completo: Criar, Listar, Editar, Deletar (soft delete) hábitos.
    *   Marcar/Desmarcar conclusão de hábitos.
    *   Cálculo de Streak atual e máximo, sensível à frequência do hábito.
    *   Seleção de Ícone, Cor, Nome, Meta de dias.
    *   **Configuração de Frequência:** Diariamente, Dias de Semana, Fins de Semana, Personalizado (seleção de dias específicos).
    *   Definição de Horário para Lembretes.
    *   Feedback tátil ao interagir com hábitos.

3.  **Interface Principal:**
    *   Lista de hábitos com visualização de progresso e streak.
    *   Header com saudação, data e estatísticas rápidas (completados hoje, recorde de sequência global).
    *   Modo Claro/Escuro funcional e persistente.
    *   Animação de Confetti ao completar todos os hábitos agendados para o dia.
    *   Navegação por Abas (Bottom Tab Navigator).

4.  **Notificações Inteligentes:**
    *   Lembretes locais agendados para a próxima ocorrência válida do hábito, respeitando sua frequência e horário.
    *   Notificações para desbloqueio de Conquistas e subida de Nível.

5.  **Estatísticas (`StatsScreen`):**
    *   Visualização do Recorde de Sequência (maior streak máximo entre todos os hábitos).
    *   Total de hábitos criados.
    *   Número de hábitos completados no dia atual (considerando os agendados).
    *   Gráfico de desempenho dos últimos 7 dias (hábitos completados por dia).
    *   Lista de desempenho individual por hábito (streak atual, % de conclusão desde a criação).

6.  **Gamificação (`AchievementsScreen` e Serviços):**
    *   Sistema de Pontos e Níveis de Usuário.
    *   Lista de Conquistas predefinidas (baseadas em streaks, número de hábitos, dias perfeitos, etc.).
    *   Desbloqueio automático de conquistas com base nas ações do usuário.
    *   Persistência de pontos e conquistas desbloqueadas no Firestore.
    *   Conquistas implementadas incluem: "Primeiro Passo", "Guerreiro da Semana", "Mestre do Mês", "Lenda Centenária", "Iniciante", "Colecionador", "Mestre dos Hábitos", "Dia Perfeito", "Semana Perfeita", "Madrugador", "Coruja Noturna", "Retorno Triunfante".

7.  **Perfil do Usuário (`ProfileScreen`):**
    *   Visualização de dados do usuário (nome, email, avatar placeholder).
    *   Estatísticas rápidas (Recorde de Sequência, Hábitos Completados Hoje).
    *   Opção de Logout.
    *   Opção de Excluir Conta (remove dados do Auth e Firestore).
    *   Controle de Tema (Claro/Escuro).
    *   Opção para habilitar/desabilitar notificações (redireciona para configurações do dispositivo para desabilitar).

## 🏃 Executando o App

### Configuração Adicional (iOS)
(Para iOS) Rode `cd ios && bundle install && bundle exec pod install && cd ..` após `npm install`.

### 1. Inicie o Metro bundler:
```bash
npm start
```

### 2. Em outro terminal, execute o app:
   - Android: `npm run android`
   - iOS: `npm run ios`


## 🎨 Arquitetura Simplificada do Projeto
```
src/
├── components/          # Componentes reutilizáveis (Checkbox, Confetti, Calendário)
├── contexts/            # Contextos da aplicação (ex: ThemeContext)
├── navigation/          # Configuração da navegação (AppNavigator)
├── screens/             # Telas da aplicação (HomeScreenV3, LoginScreenFirebase, StatsScreen, etc.)
├── services/            # Lógica de negócios e comunicação com backend/APIs
│   ├── firebase.ts      # Configuração do Firebase, Auth, Habit e User services.
│   ├── GamificationService.ts # Lógica de pontos, níveis e conquistas.
│   └── NotificationService.ts # Gerenciamento de notificações locais.
└── App.tsx              # Componente raiz da aplicação
```

## 🚧 Pendências Conhecidas / Melhorias Futuras
-   **Cálculo de Streak para `comeback_kid`:** A detecção de "streak perdido significativo" para a conquista `comeback_kid` precisa de refinamento para cobrir todos os cenários de quebra (especialmente por inatividade prolongada que não passa pelo `toggleHabit`).
-   **Agendamento de Notificações Recorrentes:** O sistema atual agenda a *próxima* ocorrência. Para notificações que se repetem confiavelmente de acordo com a frequência (ex: um hábito de "Dias de Semana" que notifica toda Seg, Ter, Qua, Qui, Sex sem intervenção manual a cada vez), seria necessário um sistema de agendamento em background mais robusto ou múltiplas notificações agendadas.
-   **Testes Unitários e de Integração:** Adicionar uma suíte de testes para garantir a estabilidade das lógicas complexas (streaks, gamificação, notificações).
-   **Monetização:** Funcionalidades premium e lógica de compra/subscrição.
-   **UI/UX:** Melhorias contínuas, como seletor de horário nativo, feedback visual mais rico, etc.
-   **Internacionalização (i18n).**

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