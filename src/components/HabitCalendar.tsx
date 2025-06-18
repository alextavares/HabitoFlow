import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { habitServices } from '../services/firebase';

interface HabitCalendarProps {
  habitId: string;
  habitColor: string;
  userId: string;
}

interface DayData {
  date: string;
  completed: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habitId, habitColor, userId }) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    loadMonthData();
  }, [currentMonth, habitId]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      
      // Primeiro e último dia do mês
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Buscar logs do mês
      const logs = await habitServices.getHabitLogs(userId, habitId, firstDay, lastDay);
      
      // Criar set de dias completados
      const completed = new Set(
        logs.filter(log => log.completed).map(log => log.date)
      );
      setCompletedDays(completed);
      
      // Gerar dados do calendário
      const days: DayData[] = [];
      const today = new Date().toISOString().split('T')[0];
      
      // Adicionar dias vazios do início
      const firstDayOfWeek = firstDay.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({
          date: '',
          completed: false,
          isToday: false,
          isCurrentMonth: false,
        });
      }
      
      // Adicionar dias do mês
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        
        days.push({
          date: dateStr,
          completed: completed.has(dateStr),
          isToday: dateStr === today,
          isCurrentMonth: true,
        });
      }
      
      setMonthData(days);
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    // Não permitir navegar para o futuro
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  const toggleDay = async (dateStr: string) => {
    if (!dateStr) return;
    
    const date = new Date(dateStr);
    const today = new Date();
    
    // Não permitir marcar dias futuros
    if (date > today) return;
    
    try {
      const isCompleted = completedDays.has(dateStr);
      await habitServices.toggleHabitCompletion(userId, habitId, date, !isCompleted);
      
      // Atualizar estado local
      const newCompletedDays = new Set(completedDays);
      if (isCompleted) {
        newCompletedDays.delete(dateStr);
      } else {
        newCompletedDays.add(dateStr);
      }
      setCompletedDays(newCompletedDays);
      
      // Atualizar dados do mês
      setMonthData(monthData.map(day => 
        day.date === dateStr ? { ...day, completed: !isCompleted } : day
      ));
    } catch (error) {
      console.error('Erro ao alternar dia:', error);
    }
  };

  const renderCalendar = () => {
    return (
      <View style={styles.calendar}>
        {/* Dias da semana */}
        <View style={styles.weekDaysRow}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        
        {/* Dias do mês */}
        <View style={styles.monthGrid}>
          {monthData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.emptyDay,
                day.isToday && styles.todayCell,
              ]}
              onPress={() => toggleDay(day.date)}
              disabled={!day.isCurrentMonth}
            >
              {day.isCurrentMonth && (
                <>
                  <Text style={[
                    styles.dayNumber,
                    day.isToday && styles.todayText,
                  ]}>
                    {new Date(day.date).getDate()}
                  </Text>
                  {day.completed && (
                    <View style={[styles.completedDot, { backgroundColor: habitColor }]} />
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header com navegação */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextMonth} 
          style={[
            styles.navButton,
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > new Date() && styles.navButtonDisabled
          ]}
          disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > new Date()}
        >
          <Text style={[
            styles.navButtonText,
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) > new Date() && styles.navButtonTextDisabled
          ]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendário */}
      {loading ? (
        <ActivityIndicator size="large" color={habitColor} style={styles.loader} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderCalendar()}
        </ScrollView>
      )}

      {/* Estatísticas do mês */}
      <View style={styles.monthStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedDays.size}</Text>
          <Text style={styles.statLabel}>Dias completos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round((completedDays.size / new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Taxa de conclusão</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: theme.textSecondary,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  calendar: {
    paddingHorizontal: 20,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    marginVertical: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyDay: {
    opacity: 0,
  },
  todayCell: {
    backgroundColor: theme.glass,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  dayNumber: {
    fontSize: 16,
    color: theme.text,
  },
  todayText: {
    fontWeight: '700',
    color: theme.primary,
  },
  completedDot: {
    position: 'absolute',
    bottom: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loader: {
    marginTop: 50,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 5,
  },
});

export default HabitCalendar;