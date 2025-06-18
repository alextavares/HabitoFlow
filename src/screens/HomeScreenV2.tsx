import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
  color: string;
  targetDays: number;
  completedDays: number;
}

const HomeScreenV2 = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      name: 'Beber água',
      icon: '💧',
      completed: false,
      streak: 5,
      color: '#818CF8',
      targetDays: 30,
      completedDays: 5,
    },
    {
      id: '2',
      name: 'Exercitar',
      icon: '💪',
      completed: true,
      streak: 12,
      color: '#10B981',
      targetDays: 30,
      completedDays: 12,
    },
    {
      id: '3',
      name: 'Meditar',
      icon: '🧘',
      completed: false,
      streak: 3,
      color: '#F59E0B',
      targetDays: 21,
      completedDays: 3,
    },
  ]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const toggleHabit = (id: string) => {
    // Animação de scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const progress = (item.completedDays / item.targetDays) * 100;
    
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.habitCard}
          onPress={() => toggleHabit(item.id)}
          activeOpacity={0.9}
        >
          {/* Glassmorphism background */}
          <View style={styles.cardBackground} />
          
          <View style={styles.habitContent}>
            <View style={styles.habitLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.habitIcon}>{item.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{item.name}</Text>
                <View style={styles.streakContainer}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakText}>{item.streak} dias</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.checkboxContainer}>
              <LinearGradient
                colors={item.completed ? [item.color, item.color + 'CC'] : ['#E5E7EB', '#E5E7EB']}
                style={styles.checkbox}
              >
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </LinearGradient>
            </View>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${progress}%`, backgroundColor: item.color }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.completedDays}/{item.targetDays}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const completedCount = habits.filter(h => h.completed).length;
  const completionRate = Math.round((completedCount / habits.length) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Olá, João! 👋</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileEmoji}>😊</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Cards de estatísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.glassmorphism]}>
          <Text style={styles.statNumber}>{completedCount}/{habits.length}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
          <View style={styles.statProgress}>
            <View style={[styles.statProgressBar, { width: `${completionRate}%` }]} />
          </View>
        </View>
        
        <View style={[styles.statCard, styles.glassmorphism]}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Streak Max</Text>
          <Text style={styles.statEmoji}>🏆</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Hábitos de Hoje</Text>
      
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id}
        style={styles.habitsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB com gradiente */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  glassmorphism: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 20,
    marginTop: 30,
    marginBottom: 20,
    color: '#111827',
    letterSpacing: -0.3,
  },
  habitsList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  habitCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  habitIcon: {
    fontSize: 26,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  streakText: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkboxContainer: {
    marginLeft: 15,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
    fontWeight: '300',
  },
});

export default HomeScreenV2;