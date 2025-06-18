import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { userServices } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface StatsScreenProps {
  user: any;
}

interface HabitStats {
  name: string;
  completedDays: number;
  totalDays: number;
  percentage: number;
  streak: number;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ user }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [overallStreak, setOverallStreak] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [habitStats, setHabitStats] = useState<HabitStats[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Carregar streak geral
      const userStreak = await AsyncStorage.getItem(`@streak_${user.uid}`);
      if (userStreak) setOverallStreak(parseInt(userStreak));

      // Carregar hábitos
      const habits = await userServices.getUserHabits(user.uid);
      setTotalHabits(habits.length);

      // Calcular estatísticas por hábito
      const stats: HabitStats[] = [];
      let todayCompleted = 0;
      const today = new Date().toDateString();

      for (const habit of habits) {
        const completedDates = habit.completedDates || [];
        const totalDays = Math.floor((Date.now() - habit.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const completedDays = completedDates.length;
        const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

        // Calcular streak do hábito
        let streak = 0;
        const sortedDates = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        if (sortedDates.length > 0) {
          const lastDate = new Date(sortedDates[0]);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate.toDateString() === today || lastDate.toDateString() === yesterday.toDateString()) {
            streak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
              const currentDate = new Date(sortedDates[i]);
              const prevDate = new Date(sortedDates[i - 1]);
              const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                streak++;
              } else {
                break;
              }
            }
          }
        }

        stats.push({
          name: habit.name,
          completedDays,
          totalDays,
          percentage,
          streak,
        });

        if (completedDates.includes(today)) {
          todayCompleted++;
        }
      }

      setHabitStats(stats);
      setCompletedToday(todayCompleted);

      // Calcular dados semanais
      const weekData = [0, 0, 0, 0, 0, 0, 0];
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        let dayCount = 0;
        for (const habit of habits) {
          if (habit.completedDates?.includes(dateStr)) {
            dayCount++;
          }
        }
        weekData[6 - i] = dayCount;
      }
      
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (index: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date().getDay();
    const dayIndex = (today - (6 - index) + 7) % 7;
    return days[dayIndex];
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const maxWeeklyValue = Math.max(...weeklyData, 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Estatísticas</Text>

      {/* Cards de resumo */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Icon name="fire" size={32} color="#FF6B6B" />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{overallStreak}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Dias de Sequência</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Icon name="format-list-checks" size={32} color="#4ECDC4" />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalHabits}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total de Hábitos</Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Icon name="check-circle" size={32} color="#95E1D3" />
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{completedToday}</Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Completados Hoje</Text>
        </View>
      </View>

      {/* Gráfico semanal */}
      <View style={[styles.weeklyChart, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Última Semana</Text>
        <View style={styles.chartContainer}>
          {weeklyData.map((value, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: theme.colors.primary,
                      height: value > 0 ? (value / maxWeeklyValue) * 100 : 2,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: theme.colors.textSecondary }]}>
                {getDayName(index)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Estatísticas por hábito */}
      <View style={styles.habitsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Desempenho por Hábito</Text>
        {habitStats.map((stat, index) => (
          <View key={index} style={[styles.habitCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.habitHeader}>
              <Text style={[styles.habitName, { color: theme.colors.text }]}>{stat.name}</Text>
              <View style={styles.habitStreak}>
                <Icon name="fire" size={16} color="#FF6B6B" />
                <Text style={[styles.streakText, { color: theme.colors.text }]}>{stat.streak}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${stat.percentage}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.percentageText, { color: theme.colors.textSecondary }]}>
                {stat.percentage}%
              </Text>
            </View>
            
            <Text style={[styles.habitStats, { color: theme.colors.textSecondary }]}>
              {stat.completedDays} de {stat.totalDays} dias
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  weeklyChart: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  habitsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  habitCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  habitStats: {
    fontSize: 12,
  },
});

export default StatsScreen;