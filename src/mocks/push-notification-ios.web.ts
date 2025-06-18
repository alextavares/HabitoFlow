// Mock do Push Notification iOS para desenvolvimento web
const PushNotificationIOSMock = {
  addEventListener: (type: string, handler: Function) => {
    console.log('[MOCK] iOS Push Notification listener added:', type);
  },
  
  removeEventListener: (type: string, handler: Function) => {
    console.log('[MOCK] iOS Push Notification listener removed:', type);
  },
  
  requestPermissions: (permissions?: any) => {
    console.log('[MOCK] iOS Push Notification permissions requested:', permissions);
    return Promise.resolve({
      alert: true,
      badge: true,
      sound: true
    });
  },
  
  abandonPermissions: () => {
    console.log('[MOCK] iOS Push Notification permissions abandoned');
  },
  
  checkPermissions: (callback: (permissions: any) => void) => {
    callback({
      alert: true,
      badge: true,
      sound: true
    });
  },
  
  getInitialNotification: () => {
    return Promise.resolve(null);
  },
  
  setApplicationIconBadgeNumber: (number: number) => {
    console.log('[MOCK] iOS badge number set to:', number);
  },
  
  getApplicationIconBadgeNumber: (callback: (number: number) => void) => {
    callback(0);
  },
  
  cancelLocalNotifications: (userInfo: any) => {
    console.log('[MOCK] iOS local notifications cancelled:', userInfo);
  },
  
  getScheduledLocalNotifications: (callback: (notifications: any[]) => void) => {
    callback([]);
  },
  
  removeAllDeliveredNotifications: () => {
    console.log('[MOCK] iOS delivered notifications removed');
  },
  
  removeDeliveredNotifications: (identifiers: string[]) => {
    console.log('[MOCK] iOS specific delivered notifications removed:', identifiers);
  }
};

export default PushNotificationIOSMock;