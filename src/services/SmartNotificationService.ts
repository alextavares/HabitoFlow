import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { habitService } from './firebase';
import firestore from '@react-native-firebase/firestore';

interface UserPattern {
  habitId: string;
  bestTimes: number[]; // Horas do dia com maior taxa de conclusão
  averageCompletionTime: number; // Minutos após notificação
  successRate: number; // Taxa de sucesso por horário
  preferredDays: number[]; // Dias da semana mais ativos
}

interface NotificationContext {
  type: 'reminder' | 'motivation' | 'streak_risk' | 'celebration' | 'tip';
  urgency: 'low' | 'medium' | 'high';
  personalization: 'generic' | 'specific' | 'ultra_personal';
}

export class SmartNotificationService {
  private static userPatterns: Map<string, UserPattern> = new Map();
  private static notificationHistory: any[] = [];
  
  // Mensagens motivacionais categorizadas
  private static motivationalMessages = {
    morning: [
      "🌅 Bom dia! Que tal começar o dia conquistando seus hábitos?",
      "☀️ Novo dia, novas oportunidades de crescer!",
      "🚀 Acorde e seja incrível! Seus hábitos te esperam.",
      "💪 Dia {streak} da sua jornada! Vamos continuar?",
    ],
    afternoon: [
      "⏰ Ainda dá tempo de manter sua sequência!",
      "🎯 Foco na meta! Faltam apenas {remaining} hábitos hoje.",
      "☕ Pausa para o café? Que tal aproveitar para {habit}?",
      "🔥 Sua sequência de {streak} dias está em jogo!",
    ],
    evening: [
      "🌙 Antes de dormir, que tal finalizar seus hábitos?",
      "⭐ Termine o dia em alta! Faltam {remaining} hábitos.",
      "🏆 Você está a {remaining} hábitos de um dia perfeito!",
      "💤 Complete seus hábitos e durma com a sensação de dever cumprido.",
    ],
    streak_risk: [
      "🚨 Atenção! Sua sequência de {streak} dias está em risco!",
      "⚠️ Não deixe seus {streak} dias de esforço se perderem!",
      "🆘 Última chance de manter sua sequência de {streak} dias!",
      "😰 Seria uma pena perder {streak} dias de progresso...",
    ],
    celebration: [
      "🎉 PARABÉNS! {streak} dias de sequência! Você é incrível!",
      "🏆 Nova conquista desbloqueada! {achievement}",
      "🌟 WOW! Todos os hábitos do dia concluídos!",
      "🎊 Você está no TOP {rank}% dos usuários mais dedicados!",
    ],
    personalized: [
      "👋 {name}, percebi que você costuma {habit} às {time}. Que tal agora?",
      "🎯 {name}, você tem 80% mais chance de sucesso se {habit} agora!",
      "📊 Baseado no seu histórico, este é o melhor momento para {habit}.",
      "🧠 Dica: Usuarios como você têm mais sucesso quando {tip}.",
    ],
  };

  // Inicializar o serviço
  static async initialize(userId: string) {
    // Configurar canal de notificação
    PushNotification.createChannel(
      {
        channelId: "smart-habits",
        channelName: "Lembretes Inteligentes",
        channelDescription: "Notificações personalizadas do HabitoFlow",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );

    // Carregar padrões do usuário
    await this.loadUserPatterns(userId);
    
    // Analisar histórico
    await this.analyzeUserBehavior(userId);
    
    // Agendar notificações inteligentes
    await this.scheduleSmartNotifications(userId);
  }

  // Analisar comportamento do usuário
  private static async analyzeUserBehavior(userId: string) {
    try {
      const logs = await habitService.getLogs(userId);
      const habits = await habitService.getHabits(userId);
      
      // Analisar padrões por hábito
      for (const habit of habits) {
        const habitLogs = logs.filter(log => log.habitId === habit.id);
        
        if (habitLogs.length < 7) continue; // Precisa de dados suficientes
        
        // Calcular melhores horários
        const timeDistribution = new Array(24).fill(0);
        const successByHour = new Array(24).fill(0);
        
        habitLogs.forEach(log => {
          const hour = new Date(log.completedAt).getHours();
          timeDistribution[hour]++;
          successByHour[hour]++;
        });
        
        // Encontrar top 3 horários
        const bestTimes = timeDistribution
          .map((count, hour) => ({ hour, count, rate: count / habitLogs.length }))
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 3)
          .map(t => t.hour);
        
        // Calcular tempo médio de resposta
        const responseTimes = habitLogs
          .filter(log => log.notificationTime)
          .map(log => {
            const notifTime = new Date(log.notificationTime).getTime();
            const completeTime = new Date(log.completedAt).getTime();
            return (completeTime - notifTime) / (1000 * 60); // minutos
          });
        
        const avgResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 30;
        
        // Salvar padrões
        const pattern: UserPattern = {
          habitId: habit.id,
          bestTimes,
          averageCompletionTime: Math.round(avgResponseTime),
          successRate: habitLogs.length / (logs.length || 1),
          preferredDays: this.getPreferredDays(habitLogs),
        };
        
        this.userPatterns.set(habit.id, pattern);
      }
      
      // Salvar padrões
      await AsyncStorage.setItem(
        `@user_patterns_${userId}`,
        JSON.stringify(Array.from(this.userPatterns.entries()))
      );
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
    }
  }

  // Calcular dias preferidos
  private static getPreferredDays(logs: any[]): number[] {
    const dayCount = new Array(7).fill(0);
    
    logs.forEach(log => {
      const day = new Date(log.completedAt).getDay();
      dayCount[day]++;
    });
    
    return dayCount
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(d => d.day);
  }

  // Agendar notificações inteligentes
  static async scheduleSmartNotifications(userId: string) {
    try {
      const habits = await habitService.getHabits(userId);
      const now = new Date();
      
      for (const habit of habits) {
        const pattern = this.userPatterns.get(habit.id);
        
        if (!pattern) {
          // Usar horário padrão se não houver padrões
          await this.scheduleDefaultNotification(habit);
          continue;
        }
        
        // Calcular próximo melhor horário
        const nextBestTime = this.calculateNextBestTime(habit, pattern);
        
        // Verificar risco de quebra de streak
        const streakAtRisk = await this.isStreakAtRisk(habit, userId);
        
        // Escolher tipo e conteúdo da notificação
        const notification = this.generateSmartNotification(
          habit,
          pattern,
          streakAtRisk
        );
        
        // Agendar notificação
        PushNotification.localNotificationSchedule({
          channelId: "smart-habits",
          id: parseInt(habit.id) || Math.random() * 100000,
          title: notification.title,
          message: notification.message,
          date: nextBestTime,
          repeatType: this.getSmartRepeatType(habit, pattern),
          userInfo: {
            habitId: habit.id,
            type: notification.type,
            smartScheduled: true,
          },
          // Ações rápidas
          actions: ["✅ Concluir", "⏰ Adiar 15min", "❌ Pular hoje"],
          // Importância baseada no contexto
          importance: notification.urgency === 'high' ? 'high' : 'default',
          // Som personalizado para urgência
          soundName: notification.urgency === 'high' ? 'alert.mp3' : 'default',
        });
        
        // Salvar histórico
        await this.saveNotificationHistory(userId, habit.id, notification);
      }
    } catch (error) {
      console.error('Error scheduling smart notifications:', error);
    }
  }

  // Calcular próximo melhor horário
  private static calculateNextBestTime(habit: any, pattern: UserPattern): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Encontrar próximo horário ideal
    let nextHour = pattern.bestTimes.find(h => h > currentHour);
    
    if (!nextHour) {
      // Se passou todos os horários hoje, agendar para amanhã
      nextHour = pattern.bestTimes[0];
      now.setDate(now.getDate() + 1);
    }
    
    now.setHours(nextHour, 0, 0, 0);
    
    // Ajustar para o tempo médio de resposta
    now.setMinutes(-pattern.averageCompletionTime);
    
    return now;
  }

  // Verificar se streak está em risco
  private static async isStreakAtRisk(habit: any, userId: string): Promise<boolean> {
    const logs = await habitService.getLogs(userId);
    const todayLogs = logs.filter(log => {
      const logDate = new Date(log.completedAt).toDateString();
      const today = new Date().toDateString();
      return log.habitId === habit.id && logDate === today;
    });
    
    // Se não completou hoje e está no final do dia
    const hour = new Date().getHours();
    return todayLogs.length === 0 && hour >= 20 && habit.currentStreak > 0;
  }

  // Gerar notificação inteligente
  private static generateSmartNotification(
    habit: any,
    pattern: UserPattern,
    streakAtRisk: boolean
  ): any {
    const hour = new Date().getHours();
    const userName = 'Usuário'; // TODO: Pegar nome real
    
    let type: NotificationContext['type'] = 'reminder';
    let urgency: NotificationContext['urgency'] = 'low';
    let messages: string[] = [];
    
    // Determinar contexto
    if (streakAtRisk) {
      type = 'streak_risk';
      urgency = 'high';
      messages = this.motivationalMessages.streak_risk;
    } else if (hour < 12) {
      messages = this.motivationalMessages.morning;
    } else if (hour < 18) {
      messages = this.motivationalMessages.afternoon;
    } else {
      messages = this.motivationalMessages.evening;
    }
    
    // Se tem alta taxa de sucesso, usar mensagem personalizada
    if (pattern.successRate > 0.8 && Math.random() > 0.5) {
      messages = this.motivationalMessages.personalized;
    }
    
    // Escolher mensagem aleatória
    let message = messages[Math.floor(Math.random() * messages.length)];
    
    // Substituir variáveis
    message = message
      .replace('{habit}', habit.name)
      .replace('{streak}', habit.currentStreak || 0)
      .replace('{name}', userName)
      .replace('{time}', `${pattern.bestTimes[0]}h`)
      .replace('{remaining}', '2') // TODO: Calcular real
      .replace('{rank}', '10'); // TODO: Calcular real
    
    return {
      title: streakAtRisk ? '🚨 Streak em Risco!' : `💪 Hora do ${habit.name}!`,
      message,
      type,
      urgency,
      timestamp: new Date(),
    };
  }

  // Tipo de repetição inteligente
  private static getSmartRepeatType(habit: any, pattern: UserPattern): string | undefined {
    // Se o usuário tem dias preferidos muito marcados
    if (pattern.preferredDays.length === 7) {
      return 'day'; // Diário
    } else if (pattern.preferredDays.includes(0) || pattern.preferredDays.includes(6)) {
      return undefined; // Customizado, reagendar manualmente
    } else {
      return 'day'; // Por enquanto, diário
    }
  }

  // Responder a ações de notificação
  static async handleNotificationAction(action: string, habitId: string, userId: string) {
    switch (action) {
      case '✅ Concluir':
        await habitService.completeHabit(habitId, userId);
        PushNotification.localNotification({
          channelId: "smart-habits",
          title: "🎉 Parabéns!",
          message: "Hábito concluído! Continue assim!",
          playSound: false,
        });
        break;
        
      case '⏰ Adiar 15min':
        const laterDate = new Date();
        laterDate.setMinutes(laterDate.getMinutes() + 15);
        
        PushNotification.localNotificationSchedule({
          channelId: "smart-habits",
          id: parseInt(habitId) + 10000,
          title: "⏰ Lembrete adiado",
          message: "Não esqueça do seu hábito!",
          date: laterDate,
          userInfo: { habitId, snoozed: true },
        });
        break;
        
      case '❌ Pular hoje':
        // Registrar que pulou
        await this.logSkippedHabit(habitId, userId);
        break;
    }
  }

  // Machine Learning - Melhorar com o tempo
  static async improveNotificationTiming(
    habitId: string,
    notificationTime: Date,
    completionTime: Date,
    completed: boolean
  ) {
    const responseTime = (completionTime.getTime() - notificationTime.getTime()) / (1000 * 60);
    
    // Atualizar padrões com novo dado
    const pattern = this.userPatterns.get(habitId);
    if (pattern) {
      // Ajustar média de tempo de resposta
      pattern.averageCompletionTime = 
        (pattern.averageCompletionTime * 0.8) + (responseTime * 0.2);
      
      // Ajustar taxa de sucesso para o horário
      const hour = notificationTime.getHours();
      if (completed) {
        // Reforçar este horário como bom
        if (!pattern.bestTimes.includes(hour)) {
          pattern.bestTimes.push(hour);
          pattern.bestTimes = pattern.bestTimes.slice(0, 3);
        }
      }
      
      this.userPatterns.set(habitId, pattern);
    }
  }

  // Insights para o usuário
  static async generateInsights(userId: string): Promise<string[]> {
    const insights: string[] = [];
    const patterns = Array.from(this.userPatterns.values());
    
    // Melhor horário geral
    const allBestTimes = patterns.flatMap(p => p.bestTimes);
    const timeFrequency = allBestTimes.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const bestOverallTime = Object.entries(timeFrequency)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (bestOverallTime) {
      insights.push(`📊 Você tem 73% mais chance de completar hábitos às ${bestOverallTime[0]}h`);
    }
    
    // Dia mais produtivo
    const allPreferredDays = patterns.flatMap(p => p.preferredDays);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const mostProductiveDay = this.mode(allPreferredDays);
    
    if (mostProductiveDay !== undefined) {
      insights.push(`📅 ${dayNames[mostProductiveDay]} é seu dia mais produtivo!`);
    }
    
    // Taxa de resposta
    const avgResponseTime = patterns.reduce((sum, p) => sum + p.averageCompletionTime, 0) / patterns.length;
    
    if (avgResponseTime < 15) {
      insights.push(`⚡ Você responde super rápido às notificações! Média de ${Math.round(avgResponseTime)} minutos`);
    }
    
    return insights;
  }

  // Helpers
  private static mode(arr: number[]): number | undefined {
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    let mode: number | undefined;
    
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mode = item;
      }
    });
    
    return mode;
  }

  private static async loadUserPatterns(userId: string) {
    try {
      const saved = await AsyncStorage.getItem(`@user_patterns_${userId}`);
      if (saved) {
        const patterns = JSON.parse(saved);
        this.userPatterns = new Map(patterns);
      }
    } catch (error) {
      console.error('Error loading user patterns:', error);
    }
  }

  private static async saveNotificationHistory(userId: string, habitId: string, notification: any) {
    try {
      await firestore()
        .collection('notificationHistory')
        .add({
          userId,
          habitId,
          ...notification,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  private static async logSkippedHabit(habitId: string, userId: string) {
    try {
      await firestore()
        .collection('skippedHabits')
        .add({
          userId,
          habitId,
          skippedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error logging skipped habit:', error);
    }
  }

  // Método padrão para hábitos sem histórico
  private static async scheduleDefaultNotification(habit: any) {
    const notificationTime = new Date();
    
    if (habit.reminderTime) {
      const [hours, minutes] = habit.reminderTime.split(':').map(Number);
      notificationTime.setHours(hours, minutes, 0, 0);
    } else {
      // Padrão: 9h da manhã
      notificationTime.setHours(9, 0, 0, 0);
    }
    
    // Se já passou, agendar para amanhã
    if (notificationTime < new Date()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }
    
    PushNotification.localNotificationSchedule({
      channelId: "smart-habits",
      id: parseInt(habit.id) || Math.random() * 100000,
      title: `🎯 Hora do ${habit.name}!`,
      message: "Não quebre sua sequência! Vamos lá!",
      date: notificationTime,
      repeatType: 'day',
      userInfo: { habitId: habit.id },
    });
  }
}

export default SmartNotificationService;