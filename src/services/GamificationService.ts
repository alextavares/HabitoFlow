import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { userServices } from './firebase';

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

  setUserId(userId: string) {
    this.userId = userId;
  }

  async getUserStats() {
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

  async getUserPoints(): Promise<number> {
    try {
      const points = await AsyncStorage.getItem(`@points_${this.userId}`);
      return points ? parseInt(points) : 0;
    } catch (error) {
      return 0;
    }
  }

  async addPoints(points: number) {
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
      
      return newPoints;
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return 0;
    }
  }

  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const savedAchievements = await AsyncStorage.getItem(`@achievements_${this.userId}`);
      if (savedAchievements) {
        return JSON.parse(savedAchievements);
      }
      return [...ACHIEVEMENTS];
    } catch (error) {
      return [...ACHIEVEMENTS];
    }
  }

  async checkAchievements(stats: {
    streak?: number;
    totalHabits?: number;
    completedToday?: number;
    totalCompleted?: number;
    time?: Date;
    lostStreak?: boolean;
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
            if (achievement.id === 'perfect_day' && stats.completedToday === stats.totalHabits && stats.totalHabits > 0) {
              shouldUnlock = true;
            }
            // Adicionar lógica para perfect_week quando implementar tracking semanal
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
            if (achievement.id === 'comeback_kid' && stats.lostStreak) {
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
        await userServices.updateUserProfile(this.userId, {
          achievements: achievements.filter(a => a.unlocked),
          totalPoints: await this.getUserPoints(),
        });
      }

      return newUnlocks;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return [];
    }
  }

  getUserLevel(): UserLevel {
    const points = this.getUserPoints();
    return this.getLevelForPoints(points);
  }

  private getLevelForPoints(points: number): UserLevel {
    for (const level of USER_LEVELS) {
      if (points >= level.minPoints && points <= level.maxPoints) {
        return level;
      }
    }
    return USER_LEVELS[0];
  }

  private getNextLevel(currentPoints: number): UserLevel | null {
    const currentLevel = this.getLevelForPoints(currentPoints);
    if (currentLevel.level < USER_LEVELS.length) {
      return USER_LEVELS[currentLevel.level];
    }
    return null;
  }

  private getLevelProgress(points: number): number {
    const level = this.getLevelForPoints(points);
    const pointsInLevel = points - level.minPoints;
    const levelRange = level.maxPoints - level.minPoints + 1;
    return Math.min(100, (pointsInLevel / levelRange) * 100);
  }

  async resetProgress() {
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