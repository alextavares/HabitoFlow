import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import LoginScreenFirebase from './src/screens/LoginScreenFirebase';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { authServices } from './src/services/firebase';
import auth from '@react-native-firebase/auth';

function App(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  // Verifica se já existe um usuário autenticado
  useEffect(() => {
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

    // Cleanup
    return subscriber;
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

  if (initializing) {
    // Mostra loading enquanto verifica autenticação
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
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