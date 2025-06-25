import React, { useState, useRef, useEffect } from 'react';
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
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Vibration, // Importar Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import LinearGradient from 'react-native-linear-gradient';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import ConfettiCelebration from '../components/ConfettiCelebration';
import HabitCalendar from '../components/HabitCalendar';
import { habitServices, authServices, Habit as FirebaseHabit, isHabitScheduledForDate } from '../services/firebase'; // Importado isHabitScheduledForDate
import NotificationService from '../services/NotificationService';

const { width } = Dimensions.get('window');

interface Habit {
  id?: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  targetDays: number;
  completed: boolean;
  streak: number;
  completedDays: number;
  createdAt: Date;
  isActive: boolean;
  reminderTime: string;
  customDays?: number[];
  maxStreak?: number;
}

interface HomeScreenV3Props {
  navigation?: any;
  user?: any;
  onLogout?: () => void;
}

const HomeScreenV3 = ({ navigation, user, onLogout }: HomeScreenV3Props) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [targetDays, setTargetDays] = useState('30');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalMaxStreak, setGlobalMaxStreak] = useState(0);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Novos estados para frequência
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]); // 0: Dom, 1: Seg, ..., 6: Sab

  // Carregar hábitos do Firebase com sincronização em tempo real
  useEffect(() => {
    const userId = authServices.getCurrentUser();
    
    if (!userId) {
      setLoading(false);
      return;
    }
    
    // Solicitar permissões de notificação ao iniciar
    const checkAndRequestPermissions = async () => {
      const hasPermission = await NotificationService.checkPermission();
      if (!hasPermission) {
        await NotificationService.requestPermission();
      }
    };
    checkAndRequestPermissions();
    
    // Configurar listener em tempo real
    const unsubscribe = habitServices.onHabitsSnapshot(userId, async (firebaseHabits) => {
      try {
        setLoading(true);
        
        // Transformar dados do Firebase com dados reais
        const habitsWithCompletion = await Promise.all(
          firebaseHabits.map(async (habit) => {
            // Verificar se foi completado hoje
            const today = new Date();
            const isCompletedToday = await habitServices.isHabitCompletedOnDate(
              userId,
              habit.id!,
              today
            );
            
            // Calcular streak real
            const { currentStreak, maxStreak } = await habitServices.calculateStreak(
              userId,
              habit.id!
            );
            
            // Calcular dias completados (últimos 30 dias)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const logs = await habitServices.getHabitLogs(
              userId,
              habit.id!,
              thirtyDaysAgo,
              today
            );
            const completedDays = logs.filter(log => log.completed).length;
            
            return {
              id: habit.id,
              name: habit.name || 'Hábito sem nome',
              icon: habit.icon || '🎯',
              color: habit.color || '#6366F1',
              frequency: habit.frequency || 'daily',
              targetDays: habit.targetDays || 30,
              completed: isCompletedToday,
              streak: currentStreak,
              completedDays: completedDays,
              createdAt: habit.createdAt instanceof Date ? habit.createdAt : new Date(),
              isActive: habit.isActive !== undefined ? habit.isActive : true,
              reminderTime: habit.reminderTime || '09:00',
              customDays: habit.customDays,
              maxStreak: maxStreak,
            } as Habit;
          })
        );
        
        // Calcular o streak máximo global
        const maxStreakGlobal = Math.max(...habitsWithCompletion.map(h => h.maxStreak || 0), 0);
        setGlobalMaxStreak(maxStreakGlobal);
        
        // console.log('Hábitos atualizados em tempo real:', habitsWithCompletion); // Removido
        setHabits(habitsWithCompletion);
      } catch (error) {
        console.error('Erro ao processar hábitos:', error);
        Alert.alert('Erro', `Não foi possível processar os hábitos: ${error}`);
      } finally {
        setLoading(false);
      }
    });
    
    // Cleanup - desinscrever quando o componente desmontar
    return () => unsubscribe();
  }, [user]);

  // Verifica se todos os hábitos estão completos
  useEffect(() => {
    const todayDate = new Date();
    // Filtrar primeiro os hábitos que estão ativos e agendados para hoje
    const relevantHabits = habits.filter(habit => habit.isActive && isHabitScheduledForDate(habit, todayDate));

    // Verificar se todos esses hábitos relevantes foram completados
    const allRelevantTodayCompleted = relevantHabits.length > 0 && relevantHabits.every(h => h.completed);

    if (allRelevantTodayCompleted && !showConfetti) {
      setShowConfetti(true);
    }
  }, [habits, showConfetti]); // isHabitScheduledForDate é estável (importada)

  const toggleHabit = async (id: string) => {
    try {
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

      const userId = authServices.getCurrentUser();
      if (!userId) return;

      const habit = habits.find(h => h.id === id);
      if (!habit) return;

      const newCompletionState = !habit.completed;
      
      // Atualizar UI imediatamente para responsividade
      setHabits(habits.map(h => 
        h.id === id ? { ...h, completed: newCompletionState } : h
      ));

      // Salvar no Firebase
      await habitServices.toggleHabitCompletion(
        userId,
        id,
        new Date(),
        newCompletionState
      );

      // Se marcou como concluído, recalcular o streak
      if (newCompletionState) {
        const { currentStreak, maxStreak } = await habitServices.calculateStreak(userId, id);
        
        setHabits(habits.map(h => 
          h.id === id ? { ...h, streak: currentStreak, maxStreak: maxStreak } : h
        ));
        
        // Atualizar max streak global se necessário
        const newMaxStreakGlobal = Math.max(maxStreak, globalMaxStreak);
        if (newMaxStreakGlobal > globalMaxStreak) {
          setGlobalMaxStreak(newMaxStreakGlobal);
        }

        // Verificar conquistas após atualizar o hábito e streak
        const updatedHabitInfo = habits.find(h => h.id === id); // Pega o hábito com streak atualizado do estado
        if (updatedHabitInfo) {
          const allCurrentHabits = await habitServices.getHabits(userId);
          let completedTodayCount = 0;
          for (const h of allCurrentHabits) {
            if (h.id && await habitServices.isHabitCompletedOnDate(userId, h.id, new Date())) {
              completedTodayCount++;
            }
          }

          GamificationService.setUserId(userId);
          // Para perfect_day, precisamos do número de hábitos agendados para hoje e quantos deles foram completados.
          const todayDateForGamification = new Date();
          const habitsScheduledTodayForGamification = habits.filter(h => h.isActive && isHabitScheduledForDate(h, todayDateForGamification));
          const completedScheduledTodayForGamification = habitsScheduledTodayForGamification.filter(h => h.completed).length;

          GamificationService.checkAchievements({
            streak: updatedHabitInfo.streak,
            time: new Date(), // Hora da conclusão
            completedToday: completedScheduledTodayForGamification, // Corrigido
            totalHabits: habitsScheduledTodayForGamification.length, // Corrigido (para o contexto de perfect_day)
            // totalHabits (para conquistas de número de hábitos) ainda pode ser allCurrentHabits.length,
            // o GamificationService precisaria distinguir ou receber ambos.
            // Por ora, focamos em corrigir para perfect_day.
            // Para outras conquistas como 'habit_collector', stats.totalHabits deve ser o total de hábitos criados.
            // A chamada em createHabit já lida com isso.
          });
        }
      }
      // Se o hábito foi desmarcado, não há verificação de conquista de streak ou conclusão no momento.
      // Lógica para Comeback Kid
      const streakBeforeToggle = habit.streak; // Streak ANTES de qualquer alteração de log ou recálculo

      // Se marcou como concluído, recalcular o streak e verificar conquistas
      if (newCompletionState) {
        const { currentStreak: newCalculatedStreak, maxStreak: newMaxStreak } = await habitServices.calculateStreak(userId, id);

        // Atualizar o estado do hábito com o novo streak
        setHabits(prevHabits => prevHabits.map(h =>
            h.id === id ? { ...h, streak: newCalculatedStreak, maxStreak: newMaxStreak, completed: newCompletionState } : h
        ));

        const newGlobalMaxStreak = Math.max(newMaxStreak, globalMaxStreak);
        if (newGlobalMaxStreak > globalMaxStreak) {
          setGlobalMaxStreak(newGlobalMaxStreak);
        }

        // Preparar stats para GamificationService
        const gamificationStats: any = { time: new Date() };
        gamificationStats.streak = newCalculatedStreak;

        const todayDateForGamification = new Date();
        const allCurrentHabits = habits; // Usar o estado 'habits' que já está sincronizado pelo listener
        const habitsScheduledTodayForGamification = allCurrentHabits.filter(h => h.isActive && isHabitScheduledForDate(h, todayDateForGamification));
        const completedScheduledTodayForGamification = habitsScheduledTodayForGamification.filter(h => h.completed || (h.id === id)).length; // Considerar o hábito atual como completo

        gamificationStats.completedToday = completedScheduledTodayForGamification;
        gamificationStats.totalHabits = habitsScheduledTodayForGamification.length;

        // Lógica específica para Comeback Kid ao completar
        if (newCalculatedStreak === 1) {
          const comebackEligible = await AsyncStorage.getItem(`@comeback_eligible_${userId}_${id}`);
          if (comebackEligible === 'true') {
            gamificationStats.triggerComebackKid = true;
            await AsyncStorage.removeItem(`@comeback_eligible_${userId}_${id}`);
          }
        }

        GamificationService.setUserId(userId);
        GamificationService.checkAchievements(gamificationStats);

        // Reagendar notificação para a próxima ocorrência válida
        if (habit.id && habit.reminderTime && notificationsEnabled) {
            NotificationService.cancelNotification(habit.id);
            const habitDetailsForNotification = allCurrentHabits.find(h => h.id === id);
            if(habitDetailsForNotification) {
                 NotificationService.scheduleNotification(habitDetailsForNotification);
            }
        }

      } else { // Hábito foi DESMARCADO
        // Recalcular o streak ao desmarcar também
        const { currentStreak: newCalculatedStreak, maxStreak: newMaxStreak } = await habitServices.calculateStreak(userId, id);
        setHabits(prevHabits => prevHabits.map(h =>
            h.id === id ? { ...h, streak: newCalculatedStreak, maxStreak: newMaxStreak, completed: newCompletionState } : h
        ));

        // Verificar se um streak significativo foi perdido ao DESMARCAR
        if (streakBeforeToggle >= 3 && newCalculatedStreak < streakBeforeToggle) {
          await AsyncStorage.setItem(`@comeback_eligible_${userId}_${id}`, 'true');
        }

        // Reagendar notificação
        if (habit.id && habit.reminderTime && notificationsEnabled) {
          NotificationService.cancelNotification(habit.id);
          const habitDetailsForNotification = habits.find(h => h.id === id);
          if(habitDetailsForNotification) {
               NotificationService.scheduleNotification(habitDetailsForNotification);
          }
        }
      }
      Vibration.vibrate(50);

    } catch (error) {
      console.error('Erro ao alternar hábito:', error);
      
      // Reverter mudança em caso de erro
      setHabits(habits.map(h => 
        h.id === id ? { ...h, completed: !h.completed } : h
      ));
      
      Alert.alert('Erro', 'Não foi possível salvar a alteração');
    }
  };

  const openAddModal = () => {
    // console.log('Abrindo modal de adicionar hábito'); // Removido
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewHabitName('');
    setSelectedIcon('🎯');
    setSelectedColor('#6366F1');
    setTargetDays('30');
    setReminderTime('09:00');
    setNotificationsEnabled(true);
    setFrequency('daily');
    setCustomDays([]);
  };

  const openCalendarModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowCalendarModal(true);
  };

  const closeCalendarModal = () => {
    setShowCalendarModal(false);
    setSelectedHabit(null);
    // Os dados serão atualizados automaticamente via listener
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setSelectedIcon(habit.icon);
    setSelectedColor(habit.color);
    setTargetDays(habit.targetDays.toString());
    setReminderTime(habit.reminderTime);
    setNotificationsEnabled(true); // Poderia ser melhorado para refletir o estado real da notificação do hábito
    setFrequency(habit.frequency || 'daily');
    setCustomDays(habit.customDays || []);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingHabit(null);
    setNewHabitName('');
    setSelectedIcon('🎯');
    setSelectedColor('#6366F1');
    setTargetDays('30');
    setReminderTime('09:00');
    setNotificationsEnabled(true);
    setFrequency('daily');
    setCustomDays([]);
  };

  const updateHabit = async () => {
    if (!newHabitName.trim() || !editingHabit) {
      Alert.alert('Ops!', 'Digite um nome para o hábito.');
      return;
    }

    const numTargetDays = parseInt(targetDays);
    if (isNaN(numTargetDays) || numTargetDays <= 0) {
      Alert.alert('Ops!', 'A meta de dias deve ser um número positivo.');
      return;
    }

    // Validação do Horário do Lembrete
    if (reminderTime) { // Só validar se houver um horário preenchido
        const timeParts = reminderTime.split(':');
        if (timeParts.length !== 2) {
            Alert.alert('Ops!', 'Formato do horário inválido. Use HH:MM.');
            return;
        }
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            Alert.alert('Ops!', 'Horário inválido. Verifique as horas e minutos.');
            return;
        }
    }

    if (frequency === 'custom' && customDays.length === 0) {
      Alert.alert('Ops!', 'Selecione pelo menos um dia para a frequência personalizada.');
      return;
    }

    // A validação de customDays já está acima, não precisa duplicar.
    // Apenas garantir que numTargetDays seja usado corretamente.

    try {
      setSaving(true);
      const userId = authServices.getCurrentUser();
      
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      const updates: any = { // Usar any para permitir customDays dinamicamente
        name: newHabitName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        targetDays: numTargetDays, // CORRIGIDO: Usar numTargetDays
        reminderTime: reminderTime,
        frequency: frequency,
      };

      if (frequency === 'custom') {
        updates.customDays = customDays.length > 0 ? customDays : [0,1,2,3,4,5,6];
      } else {
        // Se a frequência não é 'custom', queremos remover o campo customDays do Firestore.
        // Para isso, podemos atribuir firestore.FieldValue.delete()
        // Mas isso requer importar 'firestore' de '@react-native-firebase/firestore'
        // Por simplicidade aqui, vamos passar undefined, e o serviço pode tratar.
        // Ou, se o serviço de update apenas atualiza campos fornecidos, customDays não será tocado
        // a menos que explicitamente passado. Para remover, seria melhor um tratamento específico.
        // Vamos passar null para indicar que deve ser removido ou ignorado se a lógica do serviço for de merge.
        // A melhor abordagem é usar FieldValue.delete() no serviço.
        // Por ora, vamos apenas garantir que não seja passado se não for custom.
        // Se o backend faz merge, precisamos explicitamente setar para null ou usar FieldValue.delete().
        // Para este PR, vamos passar o campo `customDays` como `null` se não for custom,
        // e o serviço `updateHabit` precisará interpretar isso.
        updates.customDays = null; // Ou firestore.FieldValue.delete() se importado e usado no service
      }

      await habitServices.updateHabit(userId, editingHabit.id!, updates);
      
      // Atualizar notificação se mudou o horário ou o estado de ativação das notificações
      if (editingHabit?.id) { // Garantir que editingHabit e seu id existem
        if (notificationsEnabled) {
          // Cancela a anterior para garantir que não haja duplicatas ou horários antigos
          NotificationService.cancelNotification(editingHabit.id);
          // Agenda a nova com os dados atualizados
          // Precisamos construir o objeto hábito completo com as atualizações para o scheduleNotification
          const habitToReschedule: Habit = {
            ...(editingHabit as Habit), // Spread do hábito original (garantir que não é null)
            name: updates.name,
            icon: updates.icon,
            color: updates.color,
            targetDays: updates.targetDays,
            reminderTime: updates.reminderTime,
            frequency: updates.frequency,
            customDays: updates.customDays === null ? undefined : updates.customDays, // Se for null, passar undefined
            isActive: true, // Assumimos que se está habilitando/reagendando notificação, o hábito está ativo
            // Campos como completed, streak, completedDays, createdAt, maxStreak não são estritamente necessários para scheduleNotification
            // mas podem ser incluídos se a tipagem de Habit em scheduleNotification for rigorosa.
            // Para a função scheduleNotification atual, id, name, reminderTime, isActive, frequency, customDays são os mais importantes.
            completed: editingHabit.completed, // Manter o estado atual
            streak: editingHabit.streak, // Manter o estado atual
            completedDays: editingHabit.completedDays, // Manter o estado atual
            createdAt: editingHabit.createdAt, // Manter o estado atual
          };
          NotificationService.scheduleNotification(habitToReschedule);
        } else {
          // Se as notificações foram desabilitadas para este hábito
          NotificationService.cancelNotification(editingHabit.id);
        }
      }
      
      Alert.alert('Sucesso! ✨', 'Hábito atualizado com sucesso!');
      closeEditModal();
      
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o hábito');
    } finally {
      setSaving(false);
    }
  };

  const deleteHabit = async (habitId: string, habitName: string) => {
    Alert.alert(
      'Deletar Hábito',
      `Tem certeza que deseja deletar "${habitName}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = authServices.getCurrentUser();
              if (!userId) return;
              
              await habitServices.deleteHabit(userId, habitId);
              
              // Cancelar notificação se existir
              NotificationService.cancelNotification(habitId);
              
              Alert.alert('Sucesso', 'Hábito deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar hábito:', error);
              Alert.alert('Erro', 'Não foi possível deletar o hábito');
            }
          }
        }
      ]
    );
  };

  const createHabit = async () => {
    if (!newHabitName.trim()) {
      Alert.alert('Ops!', 'Digite um nome para o hábito.');
      return;
    }

    const numTargetDays = parseInt(targetDays);
    if (isNaN(numTargetDays) || numTargetDays <= 0) {
      Alert.alert('Ops!', 'A meta de dias deve ser um número positivo.');
      return;
    }

    // Validação do Horário do Lembrete
    if (reminderTime) { // Só validar se houver um horário preenchido
        const timeParts = reminderTime.split(':');
        if (timeParts.length !== 2) {
            Alert.alert('Ops!', 'Formato do horário inválido. Use HH:MM.');
            return;
        }
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            Alert.alert('Ops!', 'Horário inválido. Verifique as horas e minutos.');
            return;
        }
    }

    try {
      setSaving(true);
      const userId = authServices.getCurrentUser();
      
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      const habitData: any = { // Usar 'any' temporariamente ou definir um tipo mais específico para criação
        name: newHabitName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        frequency: frequency, // Usar o estado da frequência
        targetDays: numTargetDays, // Usar o valor já parseado e validado
        reminderTime: reminderTime,
      };

      if (frequency === 'custom') {
        habitData.customDays = customDays; // customDays já foi validado para não ser vazio
      }
      // Não é preciso 'else' para customDays, pois se não for 'custom', o campo não é adicionado.
      // Na atualização, o `null` já trata a remoção.

      const habitId = await habitServices.createHabit(userId, habitData);
      
      // Agendar notificação se habilitado
      if (reminderTime && notificationsEnabled) {
        const newHabit = {
          id: habitId,
          ...habitData,
          isActive: true,
        };
        NotificationService.scheduleNotification(newHabit);
      }
      
      Alert.alert('Sucesso! 🎉', 'Hábito criado com sucesso!');
      closeAddModal();
      // A lista será atualizada automaticamente via listener

      // Verificar conquistas de número de hábitos
      const currentHabits = await habitServices.getHabits(userId);
      GamificationService.setUserId(userId); // Garantir que o ID do usuário está configurado no serviço
      GamificationService.checkAchievements({ totalHabits: currentHabits.length });
      
    } catch (error) {
      console.error('Erro ao criar hábito:', error);
      Alert.alert('Erro', 'Não foi possível criar o hábito');
    } finally {
      setSaving(false);
    }
  };

  const renderHiddenItem = ({ item }: { item: Habit }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => openEditModal(item)}
      >
        <Text style={styles.backTextWhite}>✏️ Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteHabit(item.id!, item.name)}
      >
        <Text style={styles.backTextWhite}>🗑️ Deletar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHabit = ({ item }: { item: Habit }) => {
    const progress = (item.completedDays / item.targetDays) * 100;
    
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.habitCard}
          onPress={() => toggleHabit(item.id)}
          activeOpacity={0.9}
        >
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
            
            <View style={styles.rightButtons}>
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={() => openCalendarModal(item)}
              >
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              
              <View style={styles.checkboxContainer}>
                <LinearGradient
                  colors={item.completed ? [item.color, item.color + 'CC'] : [theme.border, theme.border]}
                  style={styles.checkbox}
                >
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </LinearGradient>
              </View>
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

  // Filtrar hábitos agendados para hoje
  const today = new Date();
  const habitsScheduledForToday = habits.filter(habit => isHabitScheduledForDate(habit, today));

  const completedCount = habitsScheduledForToday.filter(h => h.completed).length;
  const completionRate = habitsScheduledForToday.length > 0
    ? Math.round((completedCount / habitsScheduledForToday.length) * 100)
    : 0; // Se nenhum hábito agendado para hoje, taxa de conclusão é 0 ou 100 se não houver hábitos? (0 parece mais seguro)

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={isDarkMode ? theme.background : '#6366F1'} />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Carregando seus hábitos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={isDarkMode ? theme.background : '#6366F1'} />
      
      {/* Header com gradiente */}
      <LinearGradient
        colors={isDarkMode ? ['#1E293B', '#334155'] : ['#6366F1', '#8B5CF6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Olá, {user?.displayName || 'Usuário'}! 👋</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.themeToggle}>
                <Text style={styles.themeIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: '#818CF8' }}
                  thumbColor={isDarkMode ? '#6366F1' : '#f4f3f4'}
                />
              </View>
            </View>
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
          <Text style={styles.statNumber}>{globalMaxStreak}</Text>
          <Text style={styles.statLabel}>Streak Max</Text>
          <Text style={styles.statEmoji}>🏆</Text>
        </View>
      </View>

      {/* Botão de teste de notificações */}
      {/* <TouchableOpacity 
        style={styles.notificationTestButton}
        onPress={() => {
          NotificationService.testNotification();
          Alert.alert('Teste enviado! 🔔', 'Você deve receber uma notificação em breve.');
        }}
      >
        <Text style={styles.notificationTestText}>🔔 Testar Notificações</Text>
      </TouchableOpacity> */}

      <Text style={styles.sectionTitle}>Hábitos de Hoje</Text>
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🎯</Text>
          <Text style={styles.emptyStateTitle}>Nenhum hábito ainda</Text>
          <Text style={styles.emptyStateText}>
            Toque no botão + para criar seu primeiro hábito
          </Text>
        </View>
      ) : (
        <SwipeListView
          data={habits}
          renderItem={renderHabit}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          disableRightSwipe
          keyExtractor={item => item.id || item.name}
          style={styles.habitsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB com gradiente */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={openAddModal}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal Adicionar Hábito */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Hábito</Text>
              <TouchableOpacity onPress={closeAddModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent} 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Nome do hábito */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Hábito</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  placeholder="Ex: Beber água, Exercitar..."
                  placeholderTextColor={theme.textSecondary}
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                  maxLength={50}
                />
              </View>

              {/* Ícone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ícone</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconList}>
                  {['🎯', '💧', '💪', '🧘', '📚', '🏃', '🥗', '😴', '🎵', '✍️'].map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconItem,
                        selectedIcon === icon && styles.iconItemSelected
                      ]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Cor */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorList}>
                  {['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorItem,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorItemSelected
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Meta de dias */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meta (dias)</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  placeholder="30"
                  placeholderTextColor={theme.textSecondary}
                  value={targetDays}
                  onChangeText={setTargetDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              {/* Seleção de Frequência */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frequência</Text>
                <View style={styles.frequencyOptionsContainer}>
                  {(['daily', 'weekdays', 'weekends', 'custom'] as const).map((freqOpt) => (
                    <TouchableOpacity
                      key={freqOpt}
                      style={[
                        styles.frequencyButton,
                        frequency === freqOpt && styles.frequencyButtonSelected,
                      ]}
                      onPress={() => setFrequency(freqOpt)}
                    >
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          frequency === freqOpt && styles.frequencyButtonTextSelected,
                        ]}
                      >
                        {freqOpt === 'daily' && 'Diariamente'}
                        {freqOpt === 'weekdays' && 'Dias de Semana'}
                        {freqOpt === 'weekends' && 'Fins de Semana'}
                        {freqOpt === 'custom' && 'Personalizado'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Seleção de Dias Personalizados (se frequency === 'custom') */}
              {frequency === 'custom' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Dias Personalizados</Text>
                  <View style={styles.customDaysContainer}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, index) => (
                      <TouchableOpacity
                        key={dayName}
                        style={[
                          styles.customDayButton,
                          customDays.includes(index) && styles.customDayButtonSelected,
                        ]}
                        onPress={() => {
                          const newCustomDays = [...customDays];
                          if (newCustomDays.includes(index)) {
                            setCustomDays(newCustomDays.filter((d) => d !== index).sort((a,b) => a-b));
                          } else {
                            newCustomDays.push(index);
                            setCustomDays(newCustomDays.sort((a,b) => a-b));
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.customDayButtonText,
                            customDays.includes(index) && styles.customDayButtonTextSelected,
                          ]}
                        >
                          {dayName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Horário do lembrete */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horário do Lembrete</Text>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.timeInput, { color: theme.text, borderColor: theme.border }]}
                    placeholder="09:00"
                    placeholderTextColor={theme.textSecondary}
                    value={reminderTime}
                    onChangeText={(text) => {
                      // Formatar automaticamente HH:MM
                      let formatted = text.replace(/[^\d]/g, '');
                      if (formatted.length >= 3) {
                        formatted = formatted.slice(0, 2) + ':' + formatted.slice(2, 4);
                      }
                      setReminderTime(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  <Text style={styles.timeIcon}>⏰</Text>
                </View>
              </View>

              {/* Switch de notificações */}
              <View style={styles.inputGroup}>
                <View style={styles.switchContainer}>
                  <View>
                    <Text style={styles.inputLabel}>Notificações</Text>
                    <Text style={styles.switchDescription}>
                      Receba lembretes diários para este hábito
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: theme.border, true: '#818CF8' }}
                    thumbColor={notificationsEnabled ? '#6366F1' : '#f4f3f4'}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Indicador de scroll */}
            <View style={styles.scrollIndicator}>
              <Text style={styles.scrollIndicatorText}>↓ Role para ver mais opções</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeAddModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createHabit}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.createButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.createButtonText}>Criar Hábito</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Hábito */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Hábito</Text>
              <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Nome do Hábito */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Hábito</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Beber água, Ler livros..."
                  placeholderTextColor={theme.textSecondary}
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                />
              </View>

              {/* Ícone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ícone</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.iconList}>
                    {['🎯', '💪', '📚', '🏃', '🧘', '💊', '🍎', '💤', '🎨', '✍️'].map(icon => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconItem,
                          selectedIcon === icon && styles.iconItemSelected
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >
                        <Text style={styles.iconText}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Cor */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cor</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorList}>
                    {['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6'].map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorItem,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorItemSelected
                        ]}
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Meta de dias */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meta de Dias</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  placeholderTextColor={theme.textSecondary}
                  value={targetDays}
                  onChangeText={setTargetDays}
                  keyboardType="number-pad"
                />
              </View>

              {/* Horário do Lembrete */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Horário do Lembrete</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    placeholder="09:00"
                    placeholderTextColor={theme.textSecondary}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                  />
                  <Text style={styles.timeIcon}>🕐</Text>
                </View>
              </View>

              {/* Switch para Notificações */}
              <View style={styles.switchContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Notificações</Text>
                  <Text style={styles.switchDescription}>
                    Receba lembretes diários
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.border, true: '#6366F1' }}
                  thumbColor={notificationsEnabled ? '#8B5CF6' : '#f4f3f4'}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Botões */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeEditModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={updateHabit}
                disabled={saving}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.createButtonGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.createButtonText}>Salvar Alterações</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal do Calendário */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCalendarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.calendarModalContainer]}>
            <View style={styles.modalHeader}>
              <View style={styles.habitHeader}>
                <View style={[styles.modalIconContainer, { backgroundColor: selectedHabit?.color + '20' }]}>
                  <Text style={styles.modalIcon}>{selectedHabit?.icon}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedHabit?.name}</Text>
              </View>
              <TouchableOpacity onPress={closeCalendarModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedHabit && (
              <HabitCalendar
                habitId={selectedHabit.id!}
                habitColor={selectedHabit.color}
                userId={authServices.getCurrentUser()!}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Confetti Animation */}
      <ConfettiCelebration 
        isActive={showConfetti}
        onAnimationComplete={() => setShowConfetti(false)}
      />
    </View>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingLeft: 10,
    paddingRight: 5,
  },
  themeIcon: {
    fontSize: 20,
    marginRight: 5,
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
    backgroundColor: theme.glass,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 20,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.primary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 5,
  },
  statProgress: {
    width: '100%',
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  statProgressBar: {
    height: '100%',
    backgroundColor: theme.success,
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
    color: theme.text,
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
    backgroundColor: theme.glass,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
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
    color: theme.text,
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
    color: theme.textSecondary,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  calendarIcon: {
    fontSize: 18,
  },
  checkboxContainer: {
    marginLeft: 0,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadowOpacity,
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
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: theme.textSecondary,
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: theme.glass,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconList: {
    flexDirection: 'row',
  },
  iconItem: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: theme.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1' + '20',
  },
  iconText: {
    fontSize: 24,
  },
  colorList: {
    flexDirection: 'row',
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorItemSelected: {
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: theme.glass,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  createButton: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Calendar Modal styles
  calendarModalContainer: {
    height: '85%',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIcon: {
    fontSize: 24,
  },
  // Notification styles
  timeInputContainer: {
    position: 'relative',
  },
  timeInput: {
    paddingRight: 40,
  },
  timeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
    fontSize: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.glass,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  switchDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
  },
  notificationTestButton: {
    marginHorizontal: 20,
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.glass,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  notificationTestText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: theme.background,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
    marginBottom: 10,
    borderRadius: 20,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderRadius: 20,
  },
  backRightBtnLeft: {
    backgroundColor: '#007AFF',
    right: 75,
    borderRadius: 20,
  },
  backRightBtnRight: {
    backgroundColor: '#FF3B30',
    right: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  backTextWhite: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para seleção de frequência
  frequencyOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  frequencyButtonSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  frequencyButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyButtonTextSelected: {
    color: 'white',
  },
  customDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5, // Espaço pequeno entre os botões de dia
  },
  customDayButton: {
    flex: 1, // Para que ocupem espaço igual
    paddingVertical: 12,
    paddingHorizontal: 5, // Menor padding horizontal para caberem
    backgroundColor: theme.glass,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center', // Centralizar texto
  },
  customDayButtonSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  customDayButtonText: {
    color: theme.text,
    fontSize: 13, // Ligeiramente menor para caber "Qua"
    fontWeight: '500',
  },
  customDayButtonTextSelected: {
    color: 'white',
  },
});

export default HomeScreenV3;