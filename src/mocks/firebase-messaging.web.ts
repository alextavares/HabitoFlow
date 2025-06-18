// Mock do Firebase Messaging para desenvolvimento web
const messagingMock = () => ({
  getToken: async () => {
    console.log('[MOCK] FCM Token requested');
    return 'mock-fcm-token-' + Math.random().toString(36).substr(2, 9);
  },
  
  onMessage: (callback: (message: any) => void) => {
    console.log('[MOCK] FCM onMessage listener registered');
    // Retornar função de unsubscribe
    return () => {
      console.log('[MOCK] FCM onMessage listener removed');
    };
  },
  
  onNotificationOpenedApp: (callback: (message: any) => void) => {
    console.log('[MOCK] FCM onNotificationOpenedApp listener registered');
    return () => {};
  },
  
  getInitialNotification: async () => {
    console.log('[MOCK] FCM initial notification check');
    return null;
  },
  
  deleteToken: async () => {
    console.log('[MOCK] FCM token deleted');
  },
  
  hasPermission: async () => {
    console.log('[MOCK] FCM permission check');
    return true;
  },
  
  requestPermission: async () => {
    console.log('[MOCK] FCM permission requested');
    return true;
  },
  
  setBackgroundMessageHandler: (handler: any) => {
    console.log('[MOCK] FCM background message handler set');
  }
});

export default messagingMock;