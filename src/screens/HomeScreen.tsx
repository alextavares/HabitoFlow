import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
  color: string;
}

const HomeScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Beber água',
      icon: '💧',
      completed: false,
      streak: 5,
      color: '#3498db',
    },
    {
      id: '2',
      name: 'Exercitar',
      icon: '💪',
      completed: true,
      streak: 12,
      color: '#e74c3c',
    },
    {
      id: '3',
      name: 'Meditar',
      icon: '🧘',
      completed: false,
      streak: 3,
      color: '#9b59b6',
    },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <TouchableOpacity
      style={[styles.habitCard, { borderLeftColor: item.color }]}
      onPress={() => toggleHabit(item.id)}
    >
      <View style={styles.habitLeft}>
        <Text style={styles.habitIcon}>{item.icon}</Text>
        <View>
          <Text style={styles.habitName}>{item.name}</Text>
          <Text style={styles.habitStreak}>🔥 {item.streak} dias</Text>
        </View>
      </View>
      <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá! 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR')}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>2/3</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Maior Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>67%</Text>
          <Text style={styles.statLabel}>Taxa Sucesso</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Hábitos de Hoje</Text>
      
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        style={styles.habitsList}
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
    color: '#333',
  },
  habitsList: {
    paddingHorizontal: 20,
  },
  habitCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: '600',
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
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: '300',
  },
});

export default HomeScreen;