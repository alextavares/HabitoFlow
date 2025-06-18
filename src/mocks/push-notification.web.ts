// Mock de Push Notifications para desenvolvimento web

export const Importance = {
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
  MIN: 1,
  NONE: 0
};

class PushNotificationMock {
  private permissions = {
    alert: true,
    badge: true,
    sound: true
  };

  configure(options: any) {
    console.log('[MOCK] Push Notifications configured:', options);
    
    // Simular handlers
    if (options.onNotification) {
      // Guardar referência para simular notificações
      this.onNotificationHandler = options.onNotification;
    }
    
    if (options.onRegistrationError) {
      // Na web não há registro real
      console.log('[MOCK] Registration simulated successfully');
    }

    // Simular permissões
    if (options.permissions) {
      this.permissions = { ...this.permissions, ...options.permissions };
    }
  }

  private onNotificationHandler: any = null;

  checkPermissions(callback: (permissions: any) => void) {
    // Simular verificação de permissões
    setTimeout(() => {
      callback(this.permissions);
    }, 100);
  }

  requestPermissions(permissions?: any) {
    if (permissions) {
      this.permissions = { ...this.permissions, ...permissions };
    }
    console.log('[MOCK] Permissions requested:', this.permissions);
    return Promise.resolve(this.permissions);
  }

  localNotification(details: any) {
    console.log('[MOCK] Local notification:', details);
    
    // Simular notificação no navegador se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(details.title || 'HabitoFlow', {
        body: details.message || '',
        icon: '/logo192.png',
        badge: '/logo192.png'
      });
    }

    // Chamar handler se configurado
    if (this.onNotificationHandler) {
      setTimeout(() => {
        this.onNotificationHandler({
          ...details,
          foreground: true,
          userInteraction: false
        });
      }, 100);
    }
  }

  localNotificationSchedule(details: any) {
    console.log('[MOCK] Scheduled notification:', details);
    
    // Calcular delay
    const now = new Date().getTime();
    const scheduledTime = new Date(details.date).getTime();
    const delay = scheduledTime - now;

    if (delay > 0) {
      setTimeout(() => {
        this.localNotification(details);
      }, delay);
    }
  }

  cancelAllLocalNotifications() {
    console.log('[MOCK] All local notifications cancelled');
  }

  removeAllDeliveredNotifications() {
    console.log('[MOCK] All delivered notifications removed');
  }

  getApplicationIconBadgeNumber(callback: (count: number) => void) {
    // Simular badge count
    const count = parseInt(localStorage.getItem('mockBadgeCount') || '0');
    callback(count);
  }

  setApplicationIconBadgeNumber(count: number) {
    console.log('[MOCK] Badge number set to:', count);
    localStorage.setItem('mockBadgeCount', count.toString());
  }

  popInitialNotification(callback: (notification: any) => void) {
    // Simular que não há notificação inicial
    callback(null);
  }

  abandonPermissions() {
    console.log('[MOCK] Permissions abandoned');
    this.permissions = {
      alert: false,
      badge: false,
      sound: false
    };
  }

  registerNotificationActions(actions: any[]) {
    console.log('[MOCK] Notification actions registered:', actions);
  }

  clearLocalNotification(tag: string, userInfo: any) {
    console.log('[MOCK] Local notification cleared:', tag, userInfo);
  }

  createChannel(channel: any, callback?: () => void) {
    console.log('[MOCK] Notification channel created:', channel);
    if (callback) callback();
  }

  deleteChannel(channelId: string) {
    console.log('[MOCK] Notification channel deleted:', channelId);
  }

  channelExists(channelId: string, callback: (exists: boolean) => void) {
    console.log('[MOCK] Checking if channel exists:', channelId);
    callback(true);
  }

  getChannels(callback: (channels: string[]) => void) {
    console.log('[MOCK] Getting notification channels');
    callback(['default']);
  }

  cancelLocalNotification(id: string) {
    console.log('[MOCK] Local notification cancelled:', id);
  }
}

// Solicitar permissão do navegador para notificações
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

export default new PushNotificationMock();