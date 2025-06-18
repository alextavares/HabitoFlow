import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

// Mock do AsyncStorage para web
const AsyncStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key))
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [habits, setHabits] = useState([
    { id: 1, name: 'Beber Água', icon: '💧', completed: false, streak: 5 },
    { id: 2, name: 'Exercício', icon: '🏃', completed: false, streak: 3 },
    { id: 3, name: 'Leitura', icon: '📚', completed: false, streak: 7 },
    { id: 4, name: 'Meditação', icon: '🧘', completed: false, streak: 2 }
  ]);

  const handleLogin = () => {
    if (email && password) {
      setUserName(email.split('@')[0]);
      setIsLoggedIn(true);
      // Simular salvamento
      AsyncStorage.setItem('user', email);
    } else {
      Alert.alert('Erro', 'Preencha todos os campos');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    AsyncStorage.removeItem('user');
  };

  const toggleHabit = (id) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginBox}>
          <Text style={styles.logo}>🚀 HabitoFlow</Text>
          <Text style={styles.subtitle}>Crie hábitos, mude sua vida</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Versão Web Simplificada
          </Text>
        </View>
      </View>
    );
  }

  const completedCount = habits.filter(h => h.completed).length;
  const completionRate = Math.round((completedCount / habits.length) * 100);

  return (
    <ScrollView style={styles.mainContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR')}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Progresso de Hoje</Text>
        <Text style={styles.statsNumber}>{completionRate}%</Text>
        <Text style={styles.statsSubtitle}>{completedCount} de {habits.length} hábitos</Text>
      </View>

      <Text style={styles.sectionTitle}>Seus Hábitos</Text>
      
      {habits.map(habit => (
        <TouchableOpacity
          key={habit.id}
          style={[styles.habitCard, habit.completed && styles.habitCompleted]}
          onPress={() => toggleHabit(habit.id)}
        >
          <View style={styles.habitLeft}>
            <Text style={styles.habitIcon}>{habit.icon}</Text>
            <View>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitStreak}>🔥 {habit.streak} dias</Text>
            </View>
          </View>
          <View style={[styles.checkbox, habit.completed && styles.checkboxChecked]}>
            {habit.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      ))}

      {completedCount === habits.length && (
        <View style={styles.congratsCard}>
          <Text style={styles.congratsText}>🎉 Parabéns! Todos os hábitos concluídos!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6366F1',
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6366F1',
    paddingTop: 50,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    color: '#666',
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366F1',
    marginVertical: 10,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
    color: '#333',
  },
  habitCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  habitCompleted: {
    backgroundColor: '#E0F2FE',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  habitStreak: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  congratsCard: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  congratsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;