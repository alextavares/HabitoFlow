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
  async updateHabit(userId: string, habitId: string, updates: Partial<Habit>): Promise<void> {
    try {
      await getUserHabits(userId).doc(habitId).update(updates);
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
      // Buscar todos os logs do hábito ordenados por data
      const snapshot = await getHabitLogs(userId, habitId)
        .orderBy('date', 'desc')
        .get();

      if (snapshot.empty) {
        return { currentStreak: 0, maxStreak: 0 };
      }

      const logs = snapshot.docs.map(doc => ({
        date: doc.data().date,
        completed: doc.data().completed
      }));

      // Filtrar apenas dias completados e ordenar
      const completedDates = logs
        .filter(log => log.completed)
        .map(log => log.date)
        .sort((a, b) => b.localeCompare(a)); // Ordem decrescente

      if (completedDates.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
      }

      // Verificar se o último dia completado foi hoje ou ontem
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      // Calcular current streak
      if (completedDates[0] === today || completedDates[0] === yesterday) {
        currentStreak = 1;
        
        for (let i = 1; i < completedDates.length; i++) {
          const prevDate = new Date(completedDates[i - 1]);
          const currDate = new Date(completedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calcular max streak
      tempStreak = 1;
      maxStreak = 1;
      
      for (let i = 1; i < completedDates.length; i++) {
        const prevDate = new Date(completedDates[i - 1]);
        const currDate = new Date(completedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      return { 
        currentStreak, 
        maxStreak: Math.max(maxStreak, currentStreak)
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