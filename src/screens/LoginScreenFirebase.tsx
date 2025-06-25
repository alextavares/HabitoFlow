import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { authServices } from '../services/firebase';

const { width, height } = Dimensions.get('window');

interface LoginScreenFirebaseProps {
  onLoginSuccess: (user: any) => void;
}

const LoginScreenFirebase: React.FC<LoginScreenFirebaseProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Ops!', 'Preencha todos os campos 😊');
      return;
    }

    setIsLoading(true);

    try {
      let user;
      
      if (isLogin) {
        // Login
        user = await authServices.signIn(email, password);
        Alert.alert('Sucesso! 🎉', 'Bem-vindo de volta!');
      } else {
        // Cadastro
        user = await authServices.signUp(email, password, name);
        Alert.alert('Sucesso! 🎉', 'Conta criada com sucesso!');
      }
      
      onLoginSuccess(user);
    } catch (error: any) {
      // Mensagens de erro em português
      let errorMessage = 'Erro ao processar sua solicitação';
      
      if (error.message.includes('auth/email-already-in-use')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Email inválido';
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'Usuário não encontrado';
      } else if (error.message.includes('auth/wrong-password')) {
        errorMessage = 'Senha incorreta';
      } else if (error.message.includes('auth/invalid-credential')) {
        errorMessage = 'Email ou senha incorretos';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Ops!', 'Digite seu email primeiro');
      return;
    }

    try {
      await authServices.resetPassword(email);
      Alert.alert(
        'Email enviado! 📧',
        'Verifique sua caixa de entrada para redefinir sua senha'
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o email de recuperação');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const user = await authServices.signInWithGoogle();
      Alert.alert('Sucesso! 🎉', 'Login com Google realizado!');
      onLoginSuccess(user);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error); // Alterado para console.error
      
      let errorMessage = 'Erro ao fazer login com Google';
      
      if (error.message.includes('SIGN_IN_CANCELLED')) {
        errorMessage = 'Login cancelado pelo usuário';
      } else if (error.message.includes('IN_PROGRESS')) {
        errorMessage = 'Login já em andamento';
      } else if (error.message.includes('PLAY_SERVICES_NOT_AVAILABLE')) {
        errorMessage = 'Google Play Services não disponível';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
      setName('');
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Background com gradiente */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}
      />
      
      {/* Círculos decorativos */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Logo e título */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🎯</Text>
              <Text style={styles.logo}>HabitoFlow</Text>
              <Text style={styles.tagline}>
                Transforme hábitos em conquistas
              </Text>
            </View>

            {/* Card de formulário com glassmorphism */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </Text>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {isLogin && (
                <TouchableOpacity 
                  style={styles.forgotButton}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleAuth}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              {isLogin && (
                <>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>ou</Text>
                    <View style={styles.divider} />
                  </View>

                  {/* Login com Google */}
                  <TouchableOpacity 
                    style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#374151" size="small" />
                    ) : (
                      <>
                        <Text style={styles.googleIcon}>🔍</Text>
                        <Text style={styles.googleText}>Entrar com Google</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Switch entre login/cadastro */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={switchMode}
            >
              <Text style={styles.switchText}>
                {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                <Text style={styles.switchTextBold}>
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    left: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: 100,
    right: -30,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 30,
    backdropFilter: 'blur(20px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 15,
    paddingHorizontal: 20,
    height: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#9CA3AF',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  switchButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  switchTextBold: {
    fontWeight: '700',
    color: 'white',
  },
});

export default LoginScreenFirebase;