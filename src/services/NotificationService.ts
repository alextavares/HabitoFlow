import PushNotification, { Importance } from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isHabitScheduledForDate, Habit } from './firebase'; // Adicionado import

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
  scheduleNotification = (habit: Habit) => { // Tipo do parâmetro atualizado
    if (!habit.reminderTime || !habit.isActive || !habit.id) {
      // console.log(`Notificação não agendada para ${habit.name} (sem reminderTime, inativo ou sem ID)`);
      return;
    }

    const [hoursStr, minutesStr] = habit.reminderTime.split(':');
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error(`Horário de lembrete inválido para o hábito ${habit.id}: ${habit.reminderTime}`);
      return;
    }

    let candidateDate = new Date();
    candidateDate.setHours(hours, minutes, 0, 0); // Define o horário para hoje

    const now = new Date();

    // Se o horário candidato para hoje já passou, começar a busca a partir de amanhã
    if (candidateDate.getTime() <= now.getTime()) {
      candidateDate.setDate(candidateDate.getDate() + 1);
    }

    let nextNotificationDate: Date | null = null;

    for (let i = 0; i < 365; i++) { // Loop de segurança para no máximo 1 ano à frente
      // A condição `candidateDate > now` não é mais estritamente necessária aqui se já avançamos
      // mas é uma boa segurança. No entanto, o principal é `isHabitScheduledForDate`.
      // Se candidateDate for hoje mas o horário ainda não passou, a condição original funcionaria.
      // O importante é que, se o horário de hoje já passou, começamos amanhã.
      if (isHabitScheduledForDate(habit, candidateDate)) {
        // Adicionamos a verificação `candidateDate > now` para garantir que não agendamos para o passado
        // se, por acaso, o primeiro dia válido encontrado for hoje mas o horário exato já passou
        // (embora o ajuste inicial de candidateDate devesse prevenir isso).
        // Para maior clareza: a data candidata deve ser futura.
        if (candidateDate.getTime() > now.getTime()) {
             nextNotificationDate = new Date(candidateDate); // Cria nova instância da data
             break;
        }
      }
      candidateDate.setDate(candidateDate.getDate() + 1); // Avança para o próximo dia
    }

    if (nextNotificationDate) {
      PushNotification.localNotificationSchedule({
        id: habit.id, // Garante que o ID é uma string
        channelId: 'habit-reminders',
        title: `🎯 ${habit.name}`, // Título mais específico
        message: `Lembrete para completar seu hábito: ${habit.name}`,
        date: nextNotificationDate,
        allowWhileIdle: true,
        userInfo: { habitId: habit.id, type: 'habitReminder' }, // Adicionar tipo para identificação
        // repeatType removido
      });
      // console.log(`Notificação agendada para ${habit.name} em ${nextNotificationDate.toLocaleString()}`);
    } else {
      // console.warn(`Não foi possível encontrar uma data válida para agendar notificação para o hábito ${habit.id} nos próximos 365 dias.`);
    }
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