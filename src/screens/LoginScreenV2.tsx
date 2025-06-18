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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginScreenV2 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
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

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert('Ops!', 'Preencha todos os campos 😊');
      return;
    }

    // TODO: Implementar autenticação com Firebase
    Alert.alert('Sucesso! 🎉', isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!');
  };

  const switchMode = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setIsLogin(!isLogin);
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
                <TouchableOpacity style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleAuth}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              {/* Botões sociais */}
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialIcon}>🍎</Text>
                  <Text style={styles.socialText}>Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.socialIcon}>🔍</Text>
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
              </View>
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
  socialButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  socialText: {
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

export default LoginScreenV2;