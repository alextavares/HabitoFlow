import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { userServices, habitServices } from './firebase'; // Adicionado habitServices

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'habits' | 'completion' | 'special';
  unlocked: boolean;
  unlockedAt?: Date;
  points: number;
}

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // Conquistas de Sequência
  {
    id: 'first_day',
    title: 'Primeiro Passo',
    description: 'Complete seu primeiro dia de hábitos',
    icon: '🌱',
    requirement: 1,
    type: 'streak',
    unlocked: false,
    points: 10,
  },
  {
    id: 'week_warrior',
    title: 'Guerreiro da Semana',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '⚔️',
    requirement: 7,
    type: 'streak',
    unlocked: false,
    points: 50,
  },
  {
    id: 'month_master',
    title: 'Mestre do Mês',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '👑',
    requirement: 30,
    type: 'streak',
    unlocked: false,
    points: 150,
  },
  {
    id: 'century_legend',
    title: 'Lenda Centenária',
    description: 'Mantenha uma sequência de 100 dias',
    icon: '🏆',
    requirement: 100,
    type: 'streak',
    unlocked: false,
    points: 500,
  },
  
  // Conquistas de Hábitos
  {
    id: 'habit_starter',
    title: 'Iniciante',
    description: 'Crie seu primeiro hábito',
    icon: '🎯',
    requirement: 1,
    type: 'habits',
    unlocked: false,
    points: 10,
  },
  {
    id: 'habit_collector',
    title: 'Colecionador',
    description: 'Tenha 5 hábitos ativos',
    icon: '📚',
    requirement: 5,
    type: 'habits',
    unlocked: false,
    points: 30,
  },
  {
    id: 'habit_master',
    title: 'Mestre dos Hábitos',
    description: 'Tenha 10 hábitos ativos',
    icon: '🎓',
    requirement: 10,
    type: 'habits',
    unlocked: false,
    points: 100,
  },
  
  // Conquistas de Completude
  {
    id: 'perfect_day',
    title: 'Dia Perfeito',
    description: 'Complete todos os hábitos em um dia',
    icon: '✨',
    requirement: 1,
    type: 'completion',
    unlocked: false,
    points: 20,
  },
  {
    id: 'perfect_week',
    title: 'Semana Perfeita',
    description: 'Complete todos os hábitos por 7 dias seguidos',
    icon: '🌟',
    requirement: 7,
    type: 'completion',
    unlocked: false,
    points: 100,
  },
  
  // Conquistas Especiais
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Complete um hábito antes das 6h da manhã',
    icon: '🐦',
    requirement: 1,
    type: 'special',
    unlocked: false,
    points: 25,
  },
  {
    id: 'night_owl',
    title: 'Coruja Noturna',
    description: 'Complete um hábito depois das 22h',
    icon: '🦉',
    requirement: 1,
    type: 'special',
    unlocked: false,
    points: 25,
  },
  {
    id: 'comeback_kid',
    title: 'Retorno Triunfante',
    description: 'Volte a completar hábitos após perder uma sequência',
    icon: '💪',
    requirement: 1,
    type: 'special',
    unlocked: false,
    points: 30,
  },
];

const USER_LEVELS: UserLevel[] = [
  { level: 1, title: 'Novato', minPoints: 0, maxPoints: 99 },
  { level: 2, title: 'Aprendiz', minPoints: 100, maxPoints: 249 },
  { level: 3, title: 'Praticante', minPoints: 250, maxPoints: 499 },
  { level: 4, title: 'Habilidoso', minPoints: 500, maxPoints: 999 },
  { level: 5, title: 'Experiente', minPoints: 1000, maxPoints: 1999 },
  { level: 6, title: 'Mestre', minPoints: 2000, maxPoints: 3999 },
  { level: 7, title: 'Grão-Mestre', minPoints: 4000, maxPoints: 7999 },
  { level: 8, title: 'Lenda', minPoints: 8000, maxPoints: 14999 },
  { level: 9, title: 'Mítico', minPoints: 15000, maxPoints: 29999 },
  { level: 10, title: 'Imortal', minPoints: 30000, maxPoints: Infinity },
];

class GamificationService {
  private userId: string = '';

  /**
   * Define o ID do usuário para o qual o serviço de gamificação operará.
   * Deve ser chamado antes de outras funções que dependem do userId.
   * @param userId ID do usuário.
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Busca as estatísticas de gamificação consolidadas para o usuário.
   * Inclui pontos, conquistas, nível atual, próximo nível e progresso para o próximo nível.
   * @returns Um objeto com as estatísticas de gamificação ou null em caso de erro.
   */
  async getUserStats() {
    if (!this.userId) {
      console.error("GamificationService: userId não definido. Chame setUserId primeiro.");
      return null;
    }
    try {
      const [points, achievements, level] = await Promise.all([
        this.getUserPoints(),
        this.getUserAchievements(),
        this.getUserLevel(),
      ]);

      return {
        points,
        achievements,
        level,
        nextLevel: this.getNextLevel(points),
        progress: this.getLevelProgress(points),
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas de gamificação:', error);
      return null;
    }
  }

  /**
   * Busca os pontos de gamificação do usuário.
   * Prioriza a leitura do Firestore, com fallback para AsyncStorage.
   * Sincroniza dados do AsyncStorage para o Firestore se este último não os possuir.
   * @returns Uma Promise com o número de pontos do usuário.
   */
  async getUserPoints(): Promise<number> {
    if (!this.userId) {
      console.error("GamificationService.getUserPoints: userId não definido.");
      return 0;
    }
    try {
      // 1. Tentar ler do Firestore
      const userData = await userServices.getUserData(this.userId);
      if (userData && userData.gamificationPoints !== undefined) {
        // Se leu do Firestore, garantir que AsyncStorage está sincronizado (opcional, mas bom para consistência se AsyncStorage ainda for usado)
        // await AsyncStorage.setItem(`@points_${this.userId}`, userData.gamificationPoints.toString());
        return userData.gamificationPoints;
      }

      // 2. Se não estiver no Firestore, tentar ler do AsyncStorage (fallback)
      const asyncPoints = await AsyncStorage.getItem(`@points_${this.userId}`);
      const numericAsyncPoints = asyncPoints ? parseInt(asyncPoints) : 0;

      // 3. Se dados foram encontrados no AsyncStorage mas não no Firestore, sincronizar com Firestore
      if (userData && userData.gamificationPoints === undefined && asyncPoints !== null) {
        await userServices.updateGamificationData(this.userId, { points: numericAsyncPoints });
      }

      return numericAsyncPoints;
    } catch (error) {
      console.error('Erro ao buscar pontos do usuário:', error);
      // Fallback final para AsyncStorage em caso de erro de leitura do Firestore
      const points = await AsyncStorage.getItem(`@points_${this.userId}`);
      return points ? parseInt(points) : 0;
    }
  }

  /**
   * Adiciona uma quantidade de pontos à pontuação do usuário.
   * Atualiza os pontos no AsyncStorage e no Firestore.
   * Verifica e notifica se o usuário subiu de nível.
   * @param points Número de pontos a serem adicionados.
   * @returns Uma Promise com a nova pontuação total do usuário, ou a pontuação anterior em caso de erro.
   */
  async addPoints(points: number) {
    if (!this.userId) {
      console.error("GamificationService.addPoints: userId não definido.");
      return await this.getUserPoints(); // Retorna os pontos atuais se não houver userId
    }
    try {
      const currentPoints = await this.getUserPoints();
      const newPoints = currentPoints + points;
      await AsyncStorage.setItem(`@points_${this.userId}`, newPoints.toString());
      
      // Verificar se subiu de nível
      const oldLevel = this.getLevelForPoints(currentPoints);
      const newLevel = this.getLevelForPoints(newPoints);
      
      if (newLevel.level > oldLevel.level) {
        NotificationService.showAchievementNotification(
          '🎉 Subiu de Nível!',
          `Parabéns! Você agora é ${newLevel.title}!`
        );
      }
      
      // Sincronizar pontos com Firestore
      await userServices.updateGamificationData(this.userId, { points: newPoints });

      return newPoints;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      // Se falhar ao adicionar pontos (ex: erro no AsyncStorage ou Firestore),
      // retornar os pontos atuais pode ser mais seguro do que 0.
      // No entanto, a lógica de erro pode precisar ser mais granular.
      // Por agora, manter o retorno de 0 em caso de erro catastrófico.
      return await this.getUserPoints(); // Retorna os pontos como estavam antes da tentativa de adicionar
    }
  }

  /**
   * Busca o estado de todas as conquistas para o usuário.
   * Prioriza a leitura do Firestore (IDs das desbloqueadas), com fallback para AsyncStorage (objetos completos).
   * Sincroniza dados do AsyncStorage para o Firestore se este último não os possuir.
   * Mescla o estado salvo com a lista mestre de conquistas (`ACHIEVEMENTS`).
   * @returns Uma Promise com um array de todos os objetos Achievement, com seu estado `unlocked` atualizado.
   */
  async getUserAchievements(): Promise<Achievement[]> {
    if (!this.userId) {
      console.error("GamificationService.getUserAchievements: userId não definido.");
      return JSON.parse(JSON.stringify(ACHIEVEMENTS)); // Retorna a lista base
    }
    let finalAchievements: Achievement[] = JSON.parse(JSON.stringify(ACHIEVEMENTS)); // Cópia profunda para evitar mutações no original

    try {
      // 1. Tentar ler do Firestore (IDs das conquistas desbloqueadas)
      const userData = await userServices.getUserData(this.userId);
      let firestoreSynced = false;

      if (userData && userData.unlockedAchievementIds) {
        const unlockedIds = new Set(userData.unlockedAchievementIds);
        finalAchievements.forEach(ach => {
          if (unlockedIds.has(ach.id)) {
            ach.unlocked = true;
            // Não temos unlockedAt do Firestore aqui, poderia ser adicionado se necessário
          }
        });
        firestoreSynced = true;
        // Opcional: Sincronizar AsyncStorage se os dados do Firestore forem mais recentes ou completos
        // await AsyncStorage.setItem(`@achievements_${this.userId}`, JSON.stringify(finalAchievements));
      } else {
        // 2. Se não estiver no Firestore, tentar ler do AsyncStorage (fallback)
        const asyncAchievementsRaw = await AsyncStorage.getItem(`@achievements_${this.userId}`);
        if (asyncAchievementsRaw) {
          const asyncAchievements: Achievement[] = JSON.parse(asyncAchievementsRaw);
          // Mesclar com a lista base para garantir que todas as conquistas existam e estejam atualizadas
          // e para pegar o estado 'unlocked' do AsyncStorage.
          const asyncMap = new Map(asyncAchievements.map(a => [a.id, a]));
          finalAchievements.forEach(ach => {
            const asyncAch = asyncMap.get(ach.id);
            if (asyncAch) {
              ach.unlocked = asyncAch.unlocked;
              ach.unlockedAt = asyncAch.unlockedAt;
            }
          });

          // 3. Se dados foram encontrados no AsyncStorage mas não no Firestore, sincronizar com Firestore
          if (!firestoreSynced) { // userData.unlockedAchievementIds não existia
            await userServices.updateGamificationData(this.userId, {
              unlockedAchievements: finalAchievements.filter(a => a.unlocked)
            });
          }
        }
      }
      return finalAchievements;
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      // Fallback final para AsyncStorage em caso de erro de leitura do Firestore
      const savedAchievements = await AsyncStorage.getItem(`@achievements_${this.userId}`);
      if (savedAchievements) {
        try {
          return JSON.parse(savedAchievements);
        } catch (parseError) {
          return finalAchievements; // Retorna a lista base em caso de erro de parse
        }
      }
      return finalAchievements; // Retorna a lista base
    }
  }

  /**
   * Verifica se alguma conquista foi desbloqueada com base nas estatísticas fornecidas.
   * Se conquistas forem desbloqueadas, atualiza o estado (AsyncStorage e Firestore),
   * adiciona pontos e envia uma notificação.
   * @param stats Objeto contendo várias métricas de progresso do usuário.
   *   - `streak`: Streak atual de um hábito específico.
   *   - `totalHabits`: Número total de hábitos ativos (para `habit_collector`, etc.) OU número de hábitos agendados para hoje (para `perfect_day`).
   *   - `completedToday`: Número de hábitos agendados para hoje que foram completados (para `perfect_day`).
   *   - `time`: Hora da conclusão de um hábito (para `early_bird`, `night_owl`).
   *   - `triggerComebackKid`: Booleano para acionar a conquista `comeback_kid`.
   * @returns Uma Promise com um array das conquistas recém-desbloqueadas.
   */
  async checkAchievements(stats: {
    streak?: number;
    totalHabits?: number; // Pode ter duplo significado dependendo da conquista
    completedToday?: number;
    totalCompleted?: number;
    time?: Date;
    lostStreak?: boolean; // Mantido para possível uso futuro, mas comeback_kid usará triggerComebackKid
    triggerComebackKid?: boolean; // Novo parâmetro
  }) {
    try {
      const achievements = await this.getUserAchievements();
      const newUnlocks: Achievement[] = [];

      for (const achievement of achievements) {
        if (achievement.unlocked) continue;

        let shouldUnlock = false;

        switch (achievement.type) {
          case 'streak':
            if (stats.streak && stats.streak >= achievement.requirement) {
              shouldUnlock = true;
            }
            break;

          case 'habits':
            if (stats.totalHabits && stats.totalHabits >= achievement.requirement) {
              shouldUnlock = true;
            }
            break;

          case 'completion':
            if (achievement.id === 'perfect_day' && stats.totalHabits && stats.completedToday === stats.totalHabits && stats.totalHabits > 0) {
              shouldUnlock = true;
            }
            if (achievement.id === 'perfect_week') {
              let perfectDaysInARow = 0;
              const today = new Date();
              for (let i = 0; i < achievement.requirement; i++) { // achievement.requirement para perfect_week é 7
                const dayToCheck = new Date(today);
                dayToCheck.setDate(today.getDate() - i);
                if (await habitServices.checkIfDayWasPerfect(this.userId, dayToCheck)) {
                  perfectDaysInARow++;
                } else {
                  break; // Sequência quebrada
                }
              }
              if (perfectDaysInARow >= achievement.requirement) {
                shouldUnlock = true;
              }
            }
            break;

          case 'special':
            if (achievement.id === 'early_bird' && stats.time) {
              const hour = stats.time.getHours();
              if (hour < 6) shouldUnlock = true;
            }
            if (achievement.id === 'night_owl' && stats.time) {
              const hour = stats.time.getHours();
              if (hour >= 22) shouldUnlock = true;
            }
            if (achievement.id === 'comeback_kid' && stats.triggerComebackKid) { // Usar triggerComebackKid
              shouldUnlock = true;
            }
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
          newUnlocks.push(achievement);
          
          // Adicionar pontos
          await this.addPoints(achievement.points);
          
          // Mostrar notificação
          NotificationService.showAchievementNotification(
            `🏆 ${achievement.title}`,
            achievement.description
          );
        }
      }

      if (newUnlocks.length > 0) {
        await AsyncStorage.setItem(`@achievements_${this.userId}`, JSON.stringify(achievements));
        
        // Salvar no Firebase também
        const currentPoints = await this.getUserPoints(); // Recarregar os pontos totais atuais
        await userServices.updateGamificationData(this.userId, {
          unlockedAchievements: achievements.filter(a => a.unlocked), // Passa a lista completa de achievements desbloqueados
          points: currentPoints,
        });
      }

      return newUnlocks;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return [];
    }
  }

  /**
   * Calcula e retorna o nível atual do usuário com base em seus pontos.
   * @returns Uma Promise com o objeto UserLevel correspondente.
   */
  async getUserLevel(): Promise<UserLevel> {
    if (!this.userId) {
      console.error("GamificationService.getUserLevel: userId não definido.");
      return this.getLevelForPoints(0); // Retorna nível para 0 pontos
    }
    const points = await this.getUserPoints();
    return this.getLevelForPoints(points);
  }

  /**
   * Determina o objeto UserLevel para uma dada quantidade de pontos.
   * @param points A quantidade de pontos.
   * @returns O objeto UserLevel.
   */
  private getLevelForPoints(points: number): UserLevel {
    for (const level of USER_LEVELS) {
      if (points >= level.minPoints && points <= level.maxPoints) {
        return level;
      }
    }
    return USER_LEVELS[0];
  }

  /**
   * Determina o próximo nível para o usuário com base nos pontos atuais.
   * @param currentPoints Pontos atuais do usuário.
   * @returns O objeto UserLevel do próximo nível, ou null se já estiver no nível máximo.
   */
  private getNextLevel(currentPoints: number): UserLevel | null {
    const currentLevel = this.getLevelForPoints(currentPoints);
    if (currentLevel.level < USER_LEVELS.length) {
      return USER_LEVELS[currentLevel.level];
    }
    return null;
  }

  /**
   * Calcula o progresso (0-100) do usuário dentro do seu nível atual.
   * @param points Pontos atuais do usuário.
   * @returns A porcentagem de progresso para o próximo nível.
   */
  private getLevelProgress(points: number): number {
    const level = this.getLevelForPoints(points);
    const pointsInLevel = points - level.minPoints;
    const levelRange = level.maxPoints - level.minPoints + 1;
    return Math.min(100, (pointsInLevel / levelRange) * 100);
  }

  /**
   * Reseta o progresso de gamificação do usuário (pontos e conquistas) no AsyncStorage.
   * ATENÇÃO: Não reseta os dados no Firestore. Usar com cautela, principalmente para debug.
   */
  async resetProgress() {
    if (!this.userId) {
      console.error("GamificationService.resetProgress: userId não definido.");
      return;
    }
    try {
      await AsyncStorage.multiRemove([
        `@points_${this.userId}`,
        `@achievements_${this.userId}`,
      ]);
    } catch (error) {
      console.error('Erro ao resetar progresso:', error);
    }
  }
}

export default new GamificationService();