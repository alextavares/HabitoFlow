import PushNotification, { Importance } from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        // console.log('TOKEN:', token); // Removido
      },

      onNotification: function (notification) {
        // console.log('NOTIFICATION:', notification); // Removido
        // É importante que as notificações recebidas sejam manipuladas adequadamente.
        // Por exemplo, se o app está em primeiro plano, você pode querer mostrar um alerta customizado.
        // Se a notificação tem ações, elas devem ser tratadas aqui.
        notification.finish('backgroundFetch'); // Necessário para iOS.
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  };

  createDefaultChannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'habit-reminders',
        channelName: 'Lembretes de Hábitos',
        channelDescription: 'Notificações para lembrar de completar seus hábitos',
        importance: Importance.HIGH,
        vibrate: true,
      },
      // (created) => console.log(`createChannel 'habit-reminders' returned '${created}'`) // Removido
    );

    PushNotification.createChannel(
      {
        channelId: 'achievements',
        channelName: 'Conquistas',
        channelDescription: 'Notificações sobre suas conquistas e progresso',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      // (created) => console.log(`createChannel 'achievements' returned '${created}'`) // Removido
    );
  };

  // Solicitar permissão para notificações
  requestPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // console.log('Authorization status:', authStatus); // Removido
        const token = await messaging().getToken();
        await this.saveTokenToStorage(token); // Manter saveTokenToStorage por enquanto
        return token;
      }
      return null; // Retornar null se não habilitado
    } catch (error) {
      console.error('Permission request error:', error); // Mudar para console.error
      return null; // Retornar null em caso de erro
    }
  };

  // Salvar token FCM
  saveTokenToStorage = async (token: string) => {
    try {
      await AsyncStorage.setItem('@fcm_token', token);
    } catch (error) {
      console.error('Error saving token:', error); // Mudar para console.error
    }
  };

  // Agendar notificação local
  scheduleNotification = (habit: any) => {
    if (!habit.reminderTime || !habit.isActive) return;

    const [hours, minutes] = habit.reminderTime.split(':');
    const notificationTime = new Date();
    notificationTime.setHours(parseInt(hours));
    notificationTime.setMinutes(parseInt(minutes));
    notificationTime.setSeconds(0);

    // Se o horário já passou hoje, agenda para amanhã
    if (notificationTime.getTime() < Date.now()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    PushNotification.localNotificationSchedule({
      id: habit.id,
      channelId: 'habit-reminders',
      title: '🎯 Hora do Hábito!',
      message: `Não esqueça de completar: ${habit.name}`,
      date: notificationTime,
      repeatType: 'day',
      allowWhileIdle: true,
      userInfo: { habitId: habit.id },
    });
  };

  // Cancelar notificação
  cancelNotification = (habitId: string) => {
    PushNotification.cancelLocalNotification(habitId);
  };

  // Cancelar todas as notificações
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  // Notificação de conquista
  showAchievementNotification = (title: string, message: string) => {
    PushNotification.localNotification({
      channelId: 'achievements',
      title: title,
      message: message,
      bigText: message,
      color: '#6366F1',
      vibrate: true,
      vibration: 300,
    });
  };

  // Verificar e agendar notificações para todos os hábitos
  scheduleAllHabitNotifications = async (habits: any[]) => {
    // Cancelar todas as notificações existentes
    this.cancelAllNotifications();

    // Reagendar notificações ativas
    habits.forEach((habit) => {
      if (habit.isActive && habit.reminderTime) {
        this.scheduleNotification(habit);
      }
    });
  };

  // Notificação de streak
  showStreakNotification = (streak: number) => {
    let title = '🔥 Sequência Mantida!';
    let message = `Parabéns! Você está em uma sequência de ${streak} dias!`;

    if (streak === 7) {
      title = '🏆 Uma Semana Completa!';
      message = 'Incrível! Você manteve sua sequência por 7 dias!';
    } else if (streak === 30) {
      title = '🎉 30 Dias de Sucesso!';
      message = 'Fantástico! Um mês inteiro mantendo seus hábitos!';
    } else if (streak === 100) {
      title = '💯 Centenário!';
      message = 'Extraordinário! 100 dias de dedicação!';
    }

    this.showAchievementNotification(title, message);
  };

  // Verificar se as notificações estão habilitadas
  checkPermission = async () => {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  };
}

export default new NotificationService();