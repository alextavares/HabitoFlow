import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart, BarChart, CircularProgress } from '../components/Charts';
import { StatsSkeleton } from '../components/SkeletonLoader';
import { habitService } from '../services/firebase';
import { HapticFeedback } from '../services/HapticService';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  user: any;
}

interface Metrics {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  weeklyData: { label: string; value: number }[];
  monthlyData: { label: string; value: number }[];
  habitPerformance: { name: string; rate: number; streak: number }[];
  timeDistribution: { period: string; count: number }[];
  upcomingHabits: any[];
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
    completionRate: 0,
    weeklyData: [],
    monthlyData: [],
    habitPerformance: [],
    timeDistribution: [],
    upcomingHabits: [],
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    loadMetrics();
  }, [user]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Load habits and calculate metrics
      const habits = await habitService.getHabits(user.uid);
      const logs = await habitService.getLogs(user.uid);
      
      // Calculate metrics
      const today = new Date().toDateString();
      const completedToday = logs.filter(
        log => new Date(log.date).toDateString() === today
      ).length;

      // Weekly data for the last 7 days
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const dayLogs = logs.filter(
          log => new Date(log.date).toDateString() === dateStr
        );
        weeklyData.push({
          label: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          value: dayLogs.length,
        });
      }

      // Monthly data for the last 30 days
      const monthlyData = [];
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLogs = logs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= new Date(date.getTime() - 5 * 24 * 60 * 60 * 1000) &&
                 logDate <= date;
        });
        monthlyData.push({
          label: date.getDate().toString(),
          value: Math.round(dayLogs.length / 5),
        });
      }

      // Habit performance
      const habitPerformance = habits.map(habit => {
        const habitLogs = logs.filter(log => log.habitId === habit.id);
        const totalDays = Math.ceil(
          (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        const rate = totalDays > 0 ? (habitLogs.length / totalDays) * 100 : 0;
        
        return {
          name: habit.name,
          rate: Math.round(rate),
          streak: habit.currentStreak || 0,
        };
      }).slice(0, 5);

      // Time distribution
      const timeDistribution = [
        { period: 'Manhã', count: 0 },
        { period: 'Tarde', count: 0 },
        { period: 'Noite', count: 0 },
      ];

      habits.forEach(habit => {
        if (habit.reminderTime) {
          const hour = parseInt(habit.reminderTime.split(':')[0]);
          if (hour < 12) timeDistribution[0].count++;
          else if (hour < 18) timeDistribution[1].count++;
          else timeDistribution[2].count++;
        }
      });

      // Calculate best streak
      const bestStreak = Math.max(...habits.map(h => h.maxStreak || 0), 0);

      // Upcoming habits
      const now = new Date();
      const upcomingHabits = habits
        .filter(habit => {
          if (!habit.reminderTime) return false;
          const [hours, minutes] = habit.reminderTime.split(':').map(Number);
          const habitTime = new Date();
          habitTime.setHours(hours, minutes, 0, 0);
          return habitTime > now;
        })
        .sort((a, b) => {
          const timeA = new Date();
          const [hoursA, minutesA] = a.reminderTime!.split(':').map(Number);
          timeA.setHours(hoursA, minutesA, 0, 0);
          
          const timeB = new Date();
          const [hoursB, minutesB] = b.reminderTime!.split(':').map(Number);
          timeB.setHours(hoursB, minutesB, 0, 0);
          
          return timeA.getTime() - timeB.getTime();
        })
        .slice(0, 3);

      setMetrics({
        totalHabits: habits.length,
        completedToday,
        currentStreak: Math.max(...habits.map(h => h.currentStreak || 0), 0),
        bestStreak,
        completionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0,
        weeklyData,
        monthlyData,
        habitPerformance,
        timeDistribution,
        upcomingHabits,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    HapticFeedback.impact();
    loadMetrics();
  };

  if (loading) {
    return <StatsSkeleton />;
  }

  const MetricCard = ({ 
    icon, 
    value, 
    label, 
    color = theme.colors.primary,
    trend,
  }: {
    icon: string;
    value: string | number;
    label: string;
    color?: string;
    trend?: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.metricCard,
        {
          backgroundColor: theme.isDark
            ? 'rgba(30, 41, 59, 0.5)'
            : 'rgba(255, 255, 255, 0.9)',
          borderColor: theme.isDark
            ? 'rgba(51, 65, 85, 0.3)'
            : 'rgba(229, 231, 235, 0.5)',
        },
      ]}
      onPress={() => HapticFeedback.selection()}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Icon
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend >= 0 ? '#10B981' : '#EF4444' },
            ]}
          >
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.displayName || 'Usuário'}! 👋
            </Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => HapticFeedback.impact()}
          >
            <Icon name="bell-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon="check-circle"
          value={metrics.completedToday}
          label="Completados Hoje"
          color="#10B981"
          trend={5}
        />
        <MetricCard
          icon="fire"
          value={metrics.currentStreak}
          label="Sequência Atual"
          color="#F59E0B"
          trend={-2}
        />
        <MetricCard
          icon="trophy"
          value={metrics.bestStreak}
          label="Melhor Sequência"
          color="#8B5CF6"
        />
        <MetricCard
          icon="percent"
          value={`${metrics.completionRate}%`}
          label="Taxa de Conclusão"
          color="#3B82F6"
        />
      </View>

      {/* Progress Chart */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 41, 59, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            Progresso {selectedPeriod === 'week' ? 'Semanal' : 'Mensal'}
          </Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('week');
                HapticFeedback.selection();
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive,
                ]}
              >
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
              ]}
              onPress={() => {
                setSelectedPeriod('month');
                HapticFeedback.selection();
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive,
                ]}
              >
                Mês
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <LineChart
          data={selectedPeriod === 'week' ? metrics.weeklyData : metrics.monthlyData}
          height={200}
          animated
        />
      </View>

      {/* Habit Performance */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 41, 59, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Desempenho dos Hábitos
        </Text>
        {metrics.habitPerformance.map((habit, index) => (
          <View key={index} style={styles.habitPerformanceItem}>
            <View style={styles.habitPerformanceInfo}>
              <Text style={[styles.habitName, { color: theme.colors.text }]}>
                {habit.name}
              </Text>
              <Text style={[styles.habitStreak, { color: theme.colors.textSecondary }]}>
                {habit.streak} dias de sequência
              </Text>
            </View>
            <CircularProgress
              value={habit.rate}
              size={60}
              strokeWidth={6}
              color="#6366F1"
              showPercentage
            />
          </View>
        ))}
      </View>

      {/* Time Distribution */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 41, 59, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Distribuição por Horário
        </Text>
        <BarChart
          data={metrics.timeDistribution.map(t => ({
            label: t.period,
            value: t.count,
          }))}
          height={150}
          barColor="#6366F1"
        />
      </View>

      {/* Upcoming Habits */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 41, 59, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Próximos Hábitos
        </Text>
        {metrics.upcomingHabits.length > 0 ? (
          metrics.upcomingHabits.map((habit, index) => (
            <View key={index} style={styles.upcomingItem}>
              <View
                style={[
                  styles.upcomingIcon,
                  { backgroundColor: habit.color + '20' },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
              </View>
              <View style={styles.upcomingInfo}>
                <Text style={[styles.upcomingName, { color: theme.colors.text }]}>
                  {habit.name}
                </Text>
                <Text style={[styles.upcomingTime, { color: theme.colors.textSecondary }]}>
                  {habit.reminderTime}
                </Text>
              </View>
              <Icon
                name="bell"
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Nenhum hábito agendado para hoje
          </Text>
        )}
      </View>

      {/* Export Button */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={() => {
          HapticFeedback.impact();
          // Implement export functionality
        }}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.exportButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="download" size={20} color="white" />
          <Text style={styles.exportButtonText}>Exportar Relatório</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: -20,
  },
  metricCard: {
    width: (width - 48) / 2,
    margin: 4,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartCard: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 10,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#6366F1',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  habitPerformanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitPerformanceInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 13,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  exportButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  exportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default DashboardScreen;