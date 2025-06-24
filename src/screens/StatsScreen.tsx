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
import { habitServices, authServices } from '../services/firebase'; // Corrigido
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
  }, [user.uid]); // Adicionado user.uid como dependência

  const loadStats = async () => {
    setLoading(true);
    try {
      const userId = user.uid; // Usar user.uid diretamente das props
      if (!userId) {
        setLoading(false);
        return;
      }

      const firebaseHabits = await habitServices.getHabits(userId);
      setTotalHabits(firebaseHabits.length);

      let todayCompletedCount = 0;
      const processedHabitStats: HabitStats[] = [];
      const allCompletedDatesForWeek: string[] = [];

      for (const habit of firebaseHabits) {
        if (!habit.id) continue;

        const { currentStreak } = await habitServices.calculateStreak(userId, habit.id);

        const startDate = new Date(habit.createdAt);
        const endDate = new Date();
        const logs = await habitServices.getHabitLogs(userId, habit.id, startDate, endDate);

        const completedDays = logs.filter(log => log.completed).length;
        const isCompletedToday = await habitServices.isHabitCompletedOnDate(userId, habit.id, new Date());
        if (isCompletedToday) {
          todayCompletedCount++;
        }

        logs.filter(l => l.completed && l.date).forEach(l => {
            // Garantir que l.date é uma string antes de adicionar
            if (typeof l.date === 'string') {
                 allCompletedDatesForWeek.push(l.date);
            } else if (l.date instanceof Date) {
                 allCompletedDatesForWeek.push(l.date.toISOString().split('T')[0]);
            }
        });

        const totalDaysSinceCreation = Math.floor((endDate.getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const percentage = totalDaysSinceCreation > 0 ? Math.round((completedDays / totalDaysSinceCreation) * 100) : 0;

        processedHabitStats.push({
          name: habit.name,
          completedDays,
          totalDays: totalDaysSinceCreation,
          percentage,
          streak: currentStreak,
        });
      }

      setHabitStats(processedHabitStats);
      setCompletedToday(todayCompletedCount);

      const weekDataStats = Array(7).fill(0);
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // Inclui hoje e os 6 dias anteriores

      // Coletar todos os logs relevantes de uma vez para otimizar
      const allLogsLast7DaysByHabit: { [habitId: string]: any[] } = {};
      for (const habit of firebaseHabits) {
        if (habit.id) {
          allLogsLast7DaysByHabit[habit.id] = await habitServices.getHabitLogs(userId, habit.id, sevenDaysAgo, today);
        }
      }

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const completedHabitsOnThisDay = new Set<string>();
        for (const habit of firebaseHabits) {
          if (habit.id) {
            const logsForHabit = allLogsLast7DaysByHabit[habit.id] || [];
            if (logsForHabit.some(log => log.date === dateStr && log.completed)) {
              completedHabitsOnThisDay.add(habit.id);
            }
          }
        }
        // Os dados são preenchidos do dia mais recente para o mais antigo no array weekDataStats
        // Se o gráfico exibe da esquerda para a direita (mais antigo para mais novo), então o índice deve ser 6-i
        weekDataStats[6 - i] = completedHabitsOnThisDay.size;
      }
      setWeeklyData(weekDataStats);

      const maxIndividualStreak = Math.max(0, ...processedHabitStats.map(s => s.streak));
      setOverallStreak(maxIndividualStreak);

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