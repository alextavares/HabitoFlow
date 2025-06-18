# 🔥 Configuração do Firebase para HabitoFlow

## 📋 Passo a Passo Completo

### 1. **Criar Projeto no Firebase Console**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `habitoflow-app`
4. Desabilite Google Analytics (por enquanto)
5. Clique em "Criar projeto"

### 2. **Adicionar App Android**

1. No painel do Firebase, clique no ícone Android
2. Preencha:
   - **Nome do pacote**: `com.habitoflow` (verifique em `android/app/build.gradle`)
   - **Nome do app**: HabitoFlow
   - **Certificado SHA-1**: (opcional por enquanto)
3. Baixe o arquivo `google-services.json`
4. Coloque em: `android/app/google-services.json`

### 3. **Configurar Android**

#### No arquivo `android/build.gradle`:
```gradle
buildscript {
    ext {
        // ... outras configs
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.3.1")
        classpath("com.google.gms:google-services:4.3.15") // Adicione esta linha
    }
}
```

#### No arquivo `android/app/build.gradle`:
```gradle
apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services" // Adicione esta linha
// ... resto do arquivo
```

### 4. **Instalar Dependências Firebase**

```bash
# Core do Firebase
npm install @react-native-firebase/app

# Autenticação
npm install @react-native-firebase/auth

# Banco de dados
npm install @react-native-firebase/firestore

# Storage (para fotos de perfil futuras)
npm install @react-native-firebase/storage

# Analytics (opcional)
npm install @react-native-firebase/analytics

# Para iOS
cd ios && pod install
```

### 5. **Configurar Firestore Database**

1. No Firebase Console, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (por enquanto)
4. Selecione localização: `southamerica-east1` (São Paulo)

### 6. **Estrutura do Banco de Dados**

```javascript
// Coleções principais:

// users/{userId}
{
  email: "usuario@email.com",
  name: "João Silva",
  createdAt: timestamp,
  isPremium: false,
  settings: {
    darkMode: false,
    notifications: true,
    reminderTime: "09:00"
  }
}

// users/{userId}/habits/{habitId}
{
  name: "Beber água",
  icon: "💧",
  color: "#818CF8",
  frequency: "daily", // daily, weekdays, weekends, custom
  targetDays: 30,
  createdAt: timestamp,
  isActive: true,
  reminderTime: "09:00",
  customDays: [] // para frequency: custom
}

// users/{userId}/habits/{habitId}/logs/{logId}
{
  date: timestamp,
  completed: true,
  note: "Opcional: nota do dia"
}

// users/{userId}/streaks/{streakId}
{
  habitId: "abc123",
  currentStreak: 12,
  maxStreak: 30,
  lastCompletedDate: timestamp
}
```

### 7. **Configurar Autenticação**

1. No Firebase Console, vá para "Authentication"
2. Clique em "Começar"
3. Ative os métodos:
   - Email/Senha
   - Google (configure OAuth)
   - Apple (para iOS)

### 8. **Regras de Segurança Firestore**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Hábitos do usuário
      match /habits/{habitId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Logs dos hábitos
        match /logs/{logId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      
      // Streaks do usuário
      match /streaks/{streakId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 9. **Arquivo de Configuração Firebase**

Crie `src/services/firebase.ts`:

```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Referências às coleções
export const db = firestore();
export const authService = auth();
export const storageService = storage();

// Helper functions
export const usersCollection = db.collection('users');

export const getUserHabits = (userId: string) => 
  usersCollection.doc(userId).collection('habits');

export const getHabitLogs = (userId: string, habitId: string) =>
  getUserHabits(userId).doc(habitId).collection('logs');

// Timestamp helper
export const timestamp = firestore.FieldValue.serverTimestamp();
```

### 10. **Variáveis de Ambiente**

Crie `.env`:
```env
# Firebase Config (opcional - pode hardcodar)
FIREBASE_API_KEY=sua_api_key_aqui
FIREBASE_AUTH_DOMAIN=habitoflow-app.firebaseapp.com
FIREBASE_PROJECT_ID=habitoflow-app
FIREBASE_STORAGE_BUCKET=habitoflow-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abc123
```

### 11. **Teste de Conexão**

```javascript
// Em App.tsx ou tela de teste
import firestore from '@react-native-firebase/firestore';

const testFirebase = async () => {
  try {
    const test = await firestore()
      .collection('test')
      .add({
        message: 'Hello Firebase!',
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    console.log('Documento criado:', test.id);
  } catch (error) {
    console.error('Erro Firebase:', error);
  }
};
```

## 🚨 Troubleshooting Comum

### Erro: "No Firebase App"
- Verifique se `google-services.json` está em `android/app/`
- Limpe e reconstrua: `cd android && ./gradlew clean`

### Erro: "Could not find com.google.gms:google-services"
- Adicione `google()` em `android/build.gradle` repositories

### Build falha no iOS
- Delete `Pods` e `Podfile.lock`
- Execute: `cd ios && pod install --repo-update`

## 🎯 Próximos Passos

1. ✅ Implementar autenticação (login/cadastro)
2. ✅ Criar/ler hábitos do Firestore
3. ✅ Sincronizar dados offline
4. ✅ Implementar push notifications
5. ✅ Adicionar analytics de uso

## 💡 Dicas de Performance

- Use `.onSnapshot()` para updates em tempo real
- Implemente cache offline do Firestore
- Use batch writes para múltiplas operações
- Otimize queries com índices compostos