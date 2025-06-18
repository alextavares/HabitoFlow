// Mock do Firebase App para desenvolvimento web
const firebaseAppMock = {
  initializeApp: (config: any) => {
    console.log('[MOCK] Firebase initialized with config:', config);
    return {
      name: '[DEFAULT]',
      options: config,
      automaticDataCollectionEnabled: false
    };
  },
  
  app: () => ({
    name: '[DEFAULT]',
    options: {},
    delete: () => Promise.resolve()
  }),
  
  apps: () => [],
  
  SDK_VERSION: '9.0.0-mock',
  
  setLogLevel: (level: string) => {
    console.log('[MOCK] Firebase log level set to:', level);
  }
};

export default firebaseAppMock;
export const firebase = firebaseAppMock;