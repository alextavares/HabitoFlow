import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import { habitServices, authServices } from './firebase';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannel();
  }

  configure() {
    PushNotification.configure({
      // Chamado quando um token é registrado
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // Chamado quando uma notificação é recebida/aberta
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Processar a notificação
        if (notification.userInteraction) {
          // O usuário tocou na notificação
          console.log('Usuário interagiu com a notificação');
        }
      },

      // Configurações do Android
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  createDefaultChannel() {
    PushNotification.createChannel(
      {
        channelId: 'habitoflow-reminders',
        channelName: 'Lembretes de Hábitos',
        channelDescription: 'Lembretes para completar seus hábitos diários',
        playSound: true,
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  // Agendar notificação para um hábito
  scheduleHabitReminder(habitId: string, habitName: string, time: string, habitIcon: string = '🎯') {
    // Cancelar notificações anteriores para este hábito
    this.cancelHabitReminder(habitId);

    // Parsear horário (formato "HH:MM")
    const [hours, minutes] = time.split(':').map(Number);
    
    // Criar data para hoje com o horário especificado
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      channelId: 'habitoflow-reminders',
      id: habitId,
      title: `${habitIcon} Hora do hábito!`,
      message: `Não esqueça de completar: ${habitName}`,
      date: scheduledDate,
      repeatType: 'day', // Repetir diariamente
      allowWhileIdle: true,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      visibility: 'public',
      importance: 'high',
      userInfo: {
        habitId,
        habitName,
      },
    });

    console.log(`Lembrete agendado para ${habitName} às ${time}`);
  }

  // Cancelar notificação de um hábito
  cancelHabitReminder(habitId: string) {
    PushNotification.cancelLocalNotification(habitId);
  }

  // Agendar lembretes para todos os hábitos ativos
  async scheduleAllHabitReminders() {
    try {
      const userId = authServices.getCurrentUser();
      if (!userId) return;

      const habits = await habitServices.getHabits(userId);
      
      habits.forEach(habit => {
        if (habit.isActive) {
          this.scheduleHabitReminder(
            habit.id!,
            habit.name,
            habit.reminderTime,
            habit.icon
          );
        }
      });

      console.log(`${habits.length} lembretes agendados`);
    } catch (error) {
      console.error('Erro ao agendar lembretes:', error);
    }
  }

  // Verificar e mostrar notificação imediata para teste
  testNotification() {
    PushNotification.localNotification({
      channelId: 'habitoflow-reminders',
      title: '🎯 HabitoFlow',
      message: 'Notificações configuradas com sucesso!',
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }

  // Verificar se notificações estão habilitadas
  checkPermissions(callback: (permissions: any) => void) {
    PushNotification.checkPermissions(callback);
  }

  // Solicitar permissões (iOS)
  requestPermissions() {
    PushNotification.requestPermissions();
  }

  // Obter todas as notificações agendadas
  getScheduledNotifications(callback: (notifications: any[]) => void) {
    PushNotification.getScheduledLocalNotifications(callback);
  }

  // Cancelar todas as notificações
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default new NotificationService();