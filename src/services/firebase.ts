import auth from '@react-native-firebase/auth';
import firestore, { 
  FirebaseFirestoreTypes,
  serverTimestamp as firestoreServerTimestamp 
} from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage'; // Comentado temporariamente
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isPremium: boolean;
  settings: {
    darkMode: boolean;
    notifications: boolean;
    reminderTime: string;
  };
}

export interface Habit {
  id?: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  targetDays: number;
  createdAt: Date;
  isActive: boolean;
  reminderTime: string;
  customDays?: number[]; // 0-6 (domingo-sábado)
}

export interface HabitLog {
  id?: string;
  date: Date;
  completed: boolean;
  note?: string;
}

export interface Streak {
  id?: string;
  habitId: string;
  currentStreak: number;
  maxStreak: number;
  lastCompletedDate: Date;
}

// Configurar Google Sign-In
GoogleSignin.configure({
  webClientId: '698060765295-ucu3b9d143isrkrp5tu99g31guep9cdm.apps.googleusercontent.com',
});

// Instâncias dos serviços
export const db = firestore();
export const authService = auth();
// export const storageService = storage(); // Comentado temporariamente

// Coleções
export const usersCollection = db.collection('users');

// Helpers para subcoleções - usando a nova API
export const getUserHabits = (userId: string) => 
  db.collection('users').doc(userId).collection('habits');

export const getHabitLogs = (userId: string, habitId: string) =>
  db.collection('users').doc(userId).collection('habits').doc(habitId).collection('logs');

export const getUserStreaks = (userId: string) =>
  db.collection('users').doc(userId).collection('streaks');

// Timestamp helper - usando a nova API
export const timestamp = firestoreServerTimestamp;
export const serverTimestamp = firestore.Timestamp;

// Serviços de Autenticação
export const authServices = {
  // Criar conta
  async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      const { user } = await authService.createUserWithEmailAndPassword(email, password);
      
      if (!user) throw new Error('Erro ao criar usuário');

      // Criar documento do usuário no Firestore
      const userData: Omit<User, 'id'> = {
        email,
        name,
        createdAt: new Date(),
        isPremium: false,
        settings: {
          darkMode: false,
          notifications: true,
          reminderTime: '09:00',
        },
      };

      await usersCollection.doc(user.uid).set(userData);

      return { id: user.uid, ...userData };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Login
  async signIn(email: string, password: string): Promise<User> {
    try {
      const { user } = await authService.signInWithEmailAndPassword(email, password);
      
      if (!user) throw new Error('Erro ao fazer login');

      const userDoc = await usersCollection.doc(user.uid).get();
      const userData = userDoc.data() as Omit<User, 'id'>;

      return { id: user.uid, ...userData };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Logout
  async signOut(): Promise<void> {
    try {
      await authService.signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Recuperar senha
  async resetPassword(email: string): Promise<void> {
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Obter usuário atual
  getCurrentUser(): string | null {
    return authService.currentUser?.uid || null;
  },

  // Google Sign-In
  async signInWithGoogle(): Promise<User> {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);

      // Sign-in the user with the credential
      const { user } = await authService.signInWithCredential(googleCredential);
      
      if (!user) throw new Error('Erro ao fazer login com Google');

      // Check if user exists in Firestore
      const userDoc = await usersCollection.doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create new user document
        const userData: Omit<User, 'id'> = {
          email: user.email || '',
          name: user.displayName || '',
          createdAt: new Date(),
          isPremium: false,
          settings: {
            darkMode: false,
            notifications: true,
            reminderTime: '09:00',
          },
        };
        
        await usersCollection.doc(user.uid).set(userData);
        return { id: user.uid, ...userData };
      } else {
        const userData = userDoc.data() as Omit<User, 'id'>;
        return { id: user.uid, ...userData };
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Listener de autenticação
  onAuthStateChanged(callback: (user: any) => void) {
    return authService.onAuthStateChanged(callback);
  },

  // Deletar conta do usuário
  async deleteAccount(): Promise<void> {
    const currentUser = authService.currentUser;
    if (currentUser) {
      try {
        // 1. Deletar dados do Firestore (documento principal do usuário)
        // Implementação de exclusão de subcoleções (hábitos, logs) seria mais complexa
        // e pode ser feita via Cloud Function ou manualmente no cliente (mais chamadas).
        // Por agora, vamos deletar apenas o documento principal do usuário.
        await usersCollection.doc(currentUser.uid).delete();

        // 2. Deletar usuário do Firebase Authentication
        await currentUser.delete();
      } catch (error: any) {
        console.error("Erro ao deletar conta:", error);
        // Requer autenticação recente para currentUser.delete()
        // Se der erro de "requires-recent-login", o usuário precisa relogar.
        if (error.code === 'auth/requires-recent-login') {
          throw new Error('Esta operação requer login recente. Por favor, faça login novamente e tente excluir sua conta.');
        }
        throw new Error(`Não foi possível excluir a conta: ${error.message}`);
      }
    } else {
      throw new Error('Nenhum usuário logado para deletar.');
    }
  },

  // Atualizar dados de gamificação do usuário
  async updateGamificationData(userId: string, gamificationData: { points?: number; unlockedAchievements?: any[] }): Promise<void> {
    try {
      const updateData: { [key: string]: any } = {};
      if (gamificationData.points !== undefined) {
        updateData.gamificationPoints = gamificationData.points;
      }
      if (gamificationData.unlockedAchievements !== undefined) {
        // Salvar apenas os IDs para economizar espaço, ou os objetos completos se necessário para a UI
        updateData.unlockedAchievementIds = gamificationData.unlockedAchievements.map(a => a.id);
      }

      if (Object.keys(updateData).length > 0) {
        await usersCollection.doc(userId).set(updateData, { merge: true });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar dados de gamificação no Firestore:', error);
      throw new Error(error.message);
    }
  }
};

// Serviços de Hábitos
export const habitServices = {
  // Criar hábito
  async createHabit(userId: string, habit: Omit<Habit, 'id' | 'createdAt'>): Promise<string> {
    try {
      const habitData = {
        ...habit,
        createdAt: timestamp() as any,
        isActive: true,
      };

      const docRef = await getUserHabits(userId).add(habitData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Obter hábitos
  async getHabits(userId: string): Promise<Habit[]> {
    try {
      // Temporariamente sem orderBy para evitar índice
      const snapshot = await getUserHabits(userId)
        .where('isActive', '==', true)
        .get();

      const habits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Habit));

      // Ordenar no lado do cliente
      return habits.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Atualizar hábito
  async updateHabit(userId: string, habitId: string, updates: Partial<Habit> & { customDays?: number[] | null }): Promise<void> {
    try {
      const updateData = { ...updates };
      if (updates.customDays === null) {
        updateData.customDays = firestore.FieldValue.delete() as any;
      }
      await getUserHabits(userId).doc(habitId).update(updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Deletar hábito (soft delete)
  async deleteHabit(userId: string, habitId: string): Promise<void> {
    try {
      await getUserHabits(userId).doc(habitId).update({
        isActive: false,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Marcar hábito como feito
  async toggleHabitCompletion(
    userId: string, 
    habitId: string, 
    date: Date, 
    completed: boolean
  ): Promise<void> {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const logRef = getHabitLogs(userId, habitId).doc(dateStr);

      await logRef.set({
        date: dateStr, // Salvar como string para simplificar
        completed,
        timestamp: timestamp() as any, // Adicionar timestamp para ordenação
      });

      // TODO: Implementar updateStreak depois
      // if (completed) {
      //   await this.updateStreak(userId, habitId, date);
      // }
    } catch (error: any) {
      console.error('Erro ao salvar completion:', error);
      throw new Error(error.message);
    }
  },

  // Obter logs de um hábito
  async getHabitLogs(userId: string, habitId: string, startDate: Date, endDate: Date): Promise<HabitLog[]> {
    try {
      // Converter datas para strings YYYY-MM-DD
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const snapshot = await getHabitLogs(userId, habitId)
        .where('date', '>=', startStr)
        .where('date', '<=', endStr)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HabitLog));
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      throw new Error(error.message);
    }
  },

  // Verificar se hábito foi completado em uma data específica
  async isHabitCompletedOnDate(userId: string, habitId: string, date: Date): Promise<boolean> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const doc = await getHabitLogs(userId, habitId).doc(dateStr).get();
      
      if (!doc.exists) {
        return false;
      }
      
      return doc.data()?.completed || false;
    } catch (error: any) {
      console.error('Erro ao verificar conclusão:', error);
      return false;
    }
  },

  // Calcular streak atual
  async calculateStreak(userId: string, habitId: string): Promise<{ currentStreak: number; maxStreak: number }> {
    try {
      // 1. Buscar dados do hábito (para frequência)
      const habitDoc = await getUserHabits(userId).doc(habitId).get();
      if (!habitDoc.exists) {
        console.warn(`Hábito ${habitId} não encontrado para calcular streak.`);
        return { currentStreak: 0, maxStreak: 0 };
      }
      const habitData = habitDoc.data() as Habit;

      // 2. Buscar todos os logs do hábito ordenados por data
      const logsSnapshot = await getHabitLogs(userId, habitId)
        .where('completed', '==', true) // Buscar apenas logs completados
        .orderBy('date', 'desc')
        .get();

      if (logsSnapshot.empty) {
        return { currentStreak: 0, maxStreak: 0 };
      }

      const completedDates = logsSnapshot.docs.map(doc => doc.data().date as string);
      // As datas já vêm ordenadas do Firestore 'YYYY-MM-DD'

      if (completedDates.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
      }
      
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      // Calcular current streak
      // Verificar se o hábito foi feito hoje ou ontem, considerando a frequência
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (completedDates[0] === todayStr || completedDates[0] === yesterdayStr) {
        // Se o último log é de hoje ou ontem, iniciar contagem
        // Mas precisamos garantir que era um dia esperado
        const lastLogDate = new Date(completedDates[0] + 'T00:00:00'); // Adicionar T00:00:00 para evitar problemas de fuso ao converter de string YYYY-MM-DD
        if (isHabitScheduledForDate(habitData, lastLogDate)) {
            currentStreak = 1;
            for (let i = 0; i < completedDates.length - 1; i++) {
                let currentDateInStreak = new Date(completedDates[i] + 'T00:00:00');
                let nextDateToCheck = new Date(currentDateInStreak);
                nextDateToCheck.setDate(currentDateInStreak.getDate() - 1);
                let nextDateToCheckStr = nextDateToCheck.toISOString().split('T')[0];

                let foundNextDayInLogs = false;
                // Avançar para o próximo dia esperado
                while(nextDateToCheck >= new Date(completedDates[i+1] + 'T00:00:00')) {
                    if (isHabitScheduledForDate(habitData, nextDateToCheck)) {
                        // Este era um dia esperado. Ele está nos logs?
                        if (completedDates[i+1] === nextDateToCheckStr) {
                            currentStreak++;
                            foundNextDayInLogs = true;
                        } else {
                            // Dia esperado não encontrado nos logs, quebra o streak
                            foundNextDayInLogs = false;
                        }
                        break; // Sai do while de verificar dias no intervalo
                    }
                    // Se não era um dia esperado, continuar para o dia anterior
                    if (nextDateToCheck.toISOString().split('T')[0] === completedDates[i+1]) { // Se chegamos ao próximo log e ele não era esperado, mas está lá, conta.
                        currentStreak++; // Isso pode ser complexo, ex: hábito de fds, feito sex, sab, dom. Streak = 3.
                                          // Se feito sex, dom. Streak = 1 (sex) + 1 (dom) = 2? Ou 1?
                                          // A definição mais simples: se o próximo log é de um dia esperado e consecutivo, incrementa.
                                          // A lógica atual está mais para: se o próximo log é o dia esperado seguinte.
                        foundNextDayInLogs = true;
                        break;
                    }

                    nextDateToCheck.setDate(nextDateToCheck.getDate() - 1);
                    nextDateToCheckStr = nextDateToCheck.toISOString().split('T')[0];
                    if (nextDateToCheck < new Date(completedDates[completedDates.length -1] + 'T00:00:00') && nextDateToCheckStr !== completedDates[i+1]) break; // Otimização
                }

                if (!foundNextDayInLogs) {
                    break; // Quebrou o streak atual
                }
            }
        }
      }


      // Calcular max streak (lógica similar, mas iterando por todos os logs)
      if (completedDates.length > 0) {
        tempStreak = 0;
        for (let i = 0; i < completedDates.length; i++) {
            const logDate = new Date(completedDates[i] + 'T00:00:00');
            if (isHabitScheduledForDate(habitData, logDate)) {
                tempStreak++;
            } else {
                // Se o log não é de um dia esperado, mas foi feito, ele pode continuar um streak?
                // Por ora, vamos considerar que só dias esperados contam para streak.
                // Ou, se foi feito, mesmo não sendo esperado, ele conta?
                // Para simplificar: se foi feito, conta. Se um dia esperado foi pulado, quebra.
                tempStreak++; // Se está no log de completados, conta.
            }
            maxStreak = Math.max(maxStreak, tempStreak);

            if (i + 1 < completedDates.length) {
                let currentDateInStreak = new Date(completedDates[i] + 'T00:00:00');
                let nextExpectedLogDate = new Date(completedDates[i+1] + 'T00:00:00');

                let dayToVerify = new Date(currentDateInStreak);
                dayToVerify.setDate(dayToVerify.getDate() - 1);

                let streakBrokenInInterval = false;
                while(dayToVerify > nextExpectedLogDate) {
                    if (isHabitScheduledForDate(habitData, dayToVerify)) {
                        // Este dia era esperado, mas não foi feito (pois não está em completedDates entre completedDates[i] e completedDates[i+1])
                        streakBrokenInInterval = true;
                        break;
                    }
                    dayToVerify.setDate(dayToVerify.getDate() - 1);
                }
                if (streakBrokenInInterval) {
                    tempStreak = 0; // Quebrou o streak
                } else if (dayToVerify < nextExpectedLogDate && isHabitScheduledForDate(habitData, nextExpectedLogDate) && !isHabitScheduledForDate(habitData, currentDateInStreak)) {
                    // Ex: Hábito Seg/Qua/Sex. Feito Seg. Próximo log é Sex. Terça e Quinta não eram esperados. Streak continua.
                    // Mas se o dia atual (currentDateInStreak) não era esperado, e o próximo (nextExpectedLogDate) é,
                    // e não houve quebra, o streak não deve resetar.
                    // A lógica aqui é complexa. Simplificação:
                    // Se a diferença entre currentDateInStreak e nextExpectedLogDate tem algum dia esperado que não foi feito, quebra.
                    // Se o próximo log (nextExpectedLogDate) não é um dia esperado consecutivo ao dia atual (currentDateInStreak)
                    // (considerando os dias de folga), então o streak quebra.
                    // Esta parte precisa de revisão cuidadosa.
                }


            }
        }
        maxStreak = Math.max(maxStreak, tempStreak); // Último tempStreak
      }
       // A lógica do currentStreak precisa ser mais robusta para dias não esperados.
       // Se hoje não é um dia esperado, currentStreak deve ser 0, a menos que o último dia feito tenha sido ontem e ontem era esperado.
       if (!isHabitScheduledForDate(habitData, today) && completedDates[0] !== yesterdayStr) {
           // Se hoje não é dia de hábito e o último log não foi ontem (ou ontem não era dia de hábito)
           // currentStreak = 0; // Isso pode ser muito punitivo.
           // Melhor: se o último log (completedDates[0]) não foi um dia esperado consecutivo ao anterior,
           // ou se hoje é um dia esperado e não foi feito, e ontem também não (e era esperado).
       }


      let currentStreak = 0;
      let maxStreak = 0;

      if (completedDates.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
      }

      // --- Calcular Max Streak ---
      // Inverter completedDates para iterar do mais antigo para o mais novo para maxStreak
      const sortedCompletedDatesAsc = [...completedDates].reverse();
      let currentSequenceStreak = 0;
      let lastObligationDateMet: Date | null = null;

      for (const dateStr of sortedCompletedDatesAsc) {
        const currentDateObj = new Date(dateStr + 'T00:00:00'); // Normalizar para início do dia

        if (isHabitScheduledForDate(habitData, currentDateObj)) {
          if (currentSequenceStreak === 0) { // Começo de uma nova sequência potencial
            currentSequenceStreak = 1;
            lastObligationDateMet = currentDateObj;
          } else {
            // Verificar continuidade da sequência a partir de lastObligationDateMet
            let expectedPrevDate = new Date(lastObligationDateMet!); // Sabemos que não é null aqui
            expectedPrevDate.setDate(expectedPrevDate.getDate() + 1); // Dia seguinte a lastObligationDateMet

            let obligationSkipped = false;
            while (expectedPrevDate < currentDateObj) {
              if (isHabitScheduledForDate(habitData, expectedPrevDate)) {
                obligationSkipped = true; // Um dia de obrigação foi pulado
                break;
              }
              expectedPrevDate.setDate(expectedPrevDate.getDate() + 1);
            }

            if (obligationSkipped) {
              // Quebrou a sequência, currentSequenceStreak já foi contabilizado em maxStreak na iteração anterior.
              // Inicia nova sequência.
              currentSequenceStreak = 1;
            } else {
              // Não houve dia de obrigação pulado, e currentDateObj é um dia de obrigação.
              // A sequência continua.
              currentSequenceStreak++;
            }
            lastObligationDateMet = currentDateObj;
          }
        } else {
          // Completou em um dia de folga. Não quebra o streak atual de dias de obrigação,
          // nem o incrementa. lastObligationDateMet permanece o mesmo.
          // Apenas atualizamos maxStreak com o que temos até agora.
        }
        maxStreak = Math.max(maxStreak, currentSequenceStreak);
      }
      // maxStreak = Math.max(maxStreak, currentSequenceStreak); // Final check

      // --- Calcular Current Streak ---
      // Iterar do mais recente (completedDates[0]) para trás
      currentStreak = 0;
      let expectedCurrentDate = new Date(); // "Hoje"
      expectedCurrentDate.setHours(0, 0, 0, 0); // Normalizar para início do dia

      for (let i = 0; i < completedDates.length; i++) {
        const completedDateObj = new Date(completedDates[i] + 'T00:00:00'); // Normalizar

        if (i === 0) { // Processando o log mais recente
          // Se o log mais recente não for hoje nem ontem, o currentStreak é 0 (a menos que hoje/ontem não fossem dias de obrigação)
          // Ou se o log mais recente não for um dia de obrigação, o currentStreak é 0.
          if (!isHabitScheduledForDate(habitData, completedDateObj)) {
            break; // O log mais recente não foi num dia de obrigação, então currentStreak é 0.
          }
          // Se o log mais recente foi num dia de obrigação, mas não é "hoje" nem "ontem" (considerando dias de folga entre eles)
          // precisamos verificar se "hoje" ou "ontem" eram dias de obrigação e foram pulados.
          let dateToCheck = new Date(expectedCurrentDate); // "Hoje"
          let firstLogIsRelevantForStreak = false;

          while(dateToCheck >= completedDateObj) {
            if (dateToCheck.getTime() === completedDateObj.getTime()) { // O log é o dia que estamos verificando
                if (isHabitScheduledForDate(habitData, dateToCheck)) {
                    firstLogIsRelevantForStreak = true;
                } // Se não era dia de obrigação, mas foi feito, não inicia streak.
                break;
            }
            // Se dateToCheck era um dia de obrigação e não está no log, então o streak não pode começar hoje/ontem.
            if (isHabitScheduledForDate(habitData, dateToCheck)) {
                 firstLogIsRelevantForStreak = false;
                 break;
            }
            dateToCheck.setDate(dateToCheck.getDate() -1);
          }
          if (!firstLogIsRelevantForStreak) break; // Streak não pode começar com o log mais recente.
        }

        // Se chegamos aqui, completedDates[i] é um dia de obrigação que faz parte do streak atual.
        currentStreak++;

        // Definir o próximo `expectedPreviousObligationDate`
        let expectedPreviousObligationDate = new Date(completedDateObj);
        expectedPreviousObligationDate.setDate(expectedPreviousObligationDate.getDate() - 1);

        while (!isHabitScheduledForDate(habitData, expectedPreviousObligationDate)) {
            expectedPreviousObligationDate.setDate(expectedPreviousObligationDate.getDate() - 1);
            // Adicionar uma salvaguarda para não entrar em loop infinito se algo der muito errado
            if (expectedPreviousObligationDate < new Date('2000-01-01')) {
                 console.error("Loop de data inesperado em currentStreak");
                 return { currentStreak: 0, maxStreak: 0}; // Saída de emergência
            }
        }

        // Verificar se o próximo log (completedDates[i+1]) corresponde a expectedPreviousObligationDate
        if (i + 1 < completedDates.length) {
          if (completedDates[i+1] !== expectedPreviousObligationDate.toISOString().split('T')[0]) {
            break; // Quebrou a sequência de dias de obrigação
          }
        } else {
          break; // Não há mais logs para continuar o streak
        }
      }

      return { 
        currentStreak, 
        maxStreak
      };
    } catch (error: any) {
      console.error('Erro ao calcular streak:', error);
      return { currentStreak: 0, maxStreak: 0 };
    }
  },

  // Atualizar streak
  async updateStreak(userId: string, habitId: string, completedDate: Date): Promise<void> {
    try {
      const streakRef = getUserStreaks(userId).doc(habitId);
      const streakDoc = await streakRef.get();

      if (!streakDoc.exists) {
        // Criar novo streak
        await streakRef.set({
          habitId,
          currentStreak: 1,
          maxStreak: 1,
          lastCompletedDate: timestamp() as any,
        });
      } else {
        const streakData = streakDoc.data() as Streak;
        const lastDate = streakData.lastCompletedDate.toDate();
        const daysDiff = Math.floor((completedDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        let newCurrentStreak = streakData.currentStreak;
        
        if (daysDiff === 1) {
          // Dia consecutivo
          newCurrentStreak += 1;
        } else if (daysDiff > 1) {
          // Quebrou o streak
          newCurrentStreak = 1;
        }

        const newMaxStreak = Math.max(newCurrentStreak, streakData.maxStreak);

        await streakRef.update({
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak,
          lastCompletedDate: timestamp() as any,
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Listener em tempo real para hábitos
  onHabitsSnapshot(userId: string, callback: (habits: Habit[]) => void) {
    return getUserHabits(userId)
      .where('isActive', '==', true)
      .onSnapshot(snapshot => {
        const habits = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Habit));
        
        // Ordenar no lado do cliente para evitar necessidade de índice
        const sortedHabits = habits.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        callback(sortedHabits);
      });
  },
};

// Helper para verificar se o hábito está agendado para um dia específico
export const isHabitScheduledForDate = (habit: Habit, date: Date): boolean => {
  const dayOfWeek = date.getDay(); // 0 (Dom) a 6 (Sáb)
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Seg a Sex
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Dom ou Sáb
    case 'custom':
      // Garantir que customDays exista e seja um array
      return Array.isArray(habit.customDays) && habit.customDays.includes(dayOfWeek);
    default:
      // Considerar 'undefined' ou qualquer outro valor como 'daily' por segurança
      return true;
  }
};

// Serviços de Usuário
export const userServices = {
  // Obter dados do usuário
  async getUserData(userId: string): Promise<User | null> {
    try {
      const doc = await usersCollection.doc(userId).get();
      if (!doc.exists) return null;

      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Atualizar configurações
  async updateSettings(userId: string, settings: Partial<User['settings']>): Promise<void> {
    try {
      await usersCollection.doc(userId).update({
        settings,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Atualizar para premium
  async upgradeToPremium(userId: string): Promise<void> {
    try {
      await usersCollection.doc(userId).update({
        isPremium: true,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};