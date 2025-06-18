// Arquivo principal que exporta os mocks corretos para web
import { Platform } from 'react-native';

// Importar mocks
import authMock from './firebase-auth.web';
import firestoreMock from './firebase-firestore.web';
import AsyncStorageMock from './async-storage.web';
import GoogleSignInMock from './google-signin.web';
import PushNotificationMock from './push-notification.web';

// Sistema de detecção e exportação baseado em plataforma
const isWeb = Platform.OS === 'web';

// Firebase mocks
export const auth = isWeb ? authMock : null;
export const firestore = isWeb ? firestoreMock : null;

// AsyncStorage mock
export const AsyncStorage = isWeb ? AsyncStorageMock : null;

// Google Sign In mock
export const GoogleSignIn = isWeb ? GoogleSignInMock : null;

// Push Notification mock
export const PushNotification = isWeb ? PushNotificationMock : null;

// Helper para verificar se está rodando na web
export const isRunningOnWeb = () => isWeb;

// Função para inicializar todos os mocks
export const initializeMocks = () => {
  if (isWeb) {
    console.log('🌐 Rodando em modo Web com mocks habilitados');
    console.log('✅ Firebase Auth Mock');
    console.log('✅ Firebase Firestore Mock');
    console.log('✅ AsyncStorage Mock');
    console.log('✅ Google Sign-In Mock');
    console.log('✅ Push Notifications Mock');
  }
};