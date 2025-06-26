import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import LoginScreenFirebase from './src/screens/LoginScreenFirebase';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { authServices } from './src/services/firebase';
import auth from '@react-native-firebase/auth';

function App(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Verifica se já existe um usuário autenticado e se já viu o onboarding
  useEffect(() => {
    const checkOnboardingAndAuth = async () => {
      try {
        // Check if onboarding was completed
        const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
        
        if (!onboardingComplete) {
          setShowOnboarding(true);
        }

        // Set up auth listener
        const subscriber = auth().onAuthStateChanged((firebaseUser) => {
          if (firebaseUser) {
            // Usuário já está logado
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            });
          } else {
            // Usuário não está logado
            setUser(null);
          }
          
          // Marca como inicializado
          if (initializing) {
            setInitializing(false);
          }
        });

        return subscriber;
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setInitializing(false);
      }
    };

    const unsubscribe = checkOnboardingAndAuth();
    
    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Esconde o splash screen quando a inicialização terminar
  useEffect(() => {
    if (!initializing) {
      SplashScreen.hide();
    }
  }, [initializing]);

  // Timeout de segurança para garantir que o splash screen não fique travado
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (initializing) {
        console.warn('Timeout de inicialização atingido, forçando hide do SplashScreen');
        setInitializing(false);
        SplashScreen.hide();
      }
    }, 5000); // 5 segundos de timeout

    return () => clearTimeout(timeout);
  }, []);

  const handleLoginSuccess = (loggedUser: any) => {
    setUser(loggedUser);
  };

  const handleLogout = async () => {
    try {
      await authServices.signOut();
      setUser(null);
      Alert.alert('Até logo! 👋', 'Logout realizado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (initializing) {
    // Mostra loading enquanto verifica autenticação
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Show onboarding if it hasn't been completed
  if (showOnboarding && !user) {
    return (
      <ThemeProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {user ? (
        <AppNavigator user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreenFirebase onLoginSuccess={handleLoginSuccess} />
      )}
    </ThemeProvider>
  );
}

export default App;