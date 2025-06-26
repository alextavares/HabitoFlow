import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { HapticFeedback } from '../services/HapticService';
import SmartNotificationService from '../services/SmartNotificationService';

interface NotificationSettingsScreenProps {
  user: any;
}

interface NotificationPreferences {
  enabled: boolean;
  smartNotifications: boolean;
  dailyReminder: boolean;
  dailyReminderTime: Date;
  streakReminder: boolean;
  achievementNotifications: boolean;
  motivationalQuotes: boolean;
  weeklyReport: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: Date;
  quietHoursEnd: Date;
  notificationFrequency: 'aggressive' | 'balanced' | 'minimal';
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ user }) => {
  const { theme } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    smartNotifications: true,
    dailyReminder: true,
    dailyReminderTime: new Date(2024, 0, 1, 9, 0),
    streakReminder: true,
    achievementNotifications: true,
    motivationalQuotes: true,
    weeklyReport: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: new Date(2024, 0, 1, 22, 0),
    quietHoursEnd: new Date(2024, 0, 1, 7, 0),
    notificationFrequency: 'balanced',
  });

  useEffect(() => {
    loadPreferences();
    loadInsights();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('@notification_preferences');
      if (saved) {
        const savedPrefs = JSON.parse(saved);
        // Convert date strings back to Date objects
        savedPrefs.dailyReminderTime = new Date(savedPrefs.dailyReminderTime);
        savedPrefs.quietHoursStart = new Date(savedPrefs.quietHoursStart);
        savedPrefs.quietHoursEnd = new Date(savedPrefs.quietHoursEnd);
        setPreferences(savedPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const userInsights = await SmartNotificationService.generateInsights(user.uid);
      setInsights(userInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('@notification_preferences', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      
      // Reinicializar notificações com novas preferências
      if (newPrefs.enabled && newPrefs.smartNotifications) {
        await SmartNotificationService.initialize(user.uid);
      }
      
      HapticFeedback.notification('success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Erro', 'Não foi possível salvar as preferências');
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPrefs);
    HapticFeedback.selection();
  };

  const setTime = (event: any, selectedDate?: Date, field?: string) => {
    setShowTimePicker(null);
    if (selectedDate && field) {
      const newPrefs = { ...preferences, [field]: selectedDate };
      savePreferences(newPrefs);
    }
  };

  const openSystemSettings = () => {
    HapticFeedback.impact();
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const setFrequency = (frequency: NotificationPreferences['notificationFrequency']) => {
    HapticFeedback.selection();
    const newPrefs = { ...preferences, notificationFrequency: frequency };
    savePreferences(newPrefs);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    showArrow = false,
    onPress,
    disabled = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: () => void;
    showArrow?: boolean;
    onPress?: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingRow,
        disabled && styles.settingRowDisabled,
        { borderBottomColor: theme.colors.border }
      ]}
      onPress={onPress}
      disabled={!onPress || disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
        <Icon name={icon} size={24} color={disabled ? theme.colors.textSecondary : theme.colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[
          styles.settingTitle, 
          { color: disabled ? theme.colors.textSecondary : theme.colors.text }
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
          thumbColor={value ? 'white' : '#f4f3f4'}
          disabled={disabled}
        />
      ) : showArrow ? (
        <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Smart Insights */}
      {insights.length > 0 && (
        <View style={[styles.insightsCard, { backgroundColor: theme.colors.primary + '10' }]}>
          <View style={styles.insightsHeader}>
            <Icon name="brain" size={24} color={theme.colors.primary} />
            <Text style={[styles.insightsTitle, { color: theme.colors.primary }]}>
              Insights Inteligentes
            </Text>
          </View>
          {insights.map((insight, index) => (
            <Text key={index} style={[styles.insightText, { color: theme.colors.text }]}>
              {insight}
            </Text>
          ))}
        </View>
      )}

      {/* Notificações Principais */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Notificações Principais
        </Text>
        
        <SettingRow
          icon="bell"
          title="Notificações Ativadas"
          subtitle="Ative para receber lembretes"
          value={preferences.enabled}
          onToggle={() => togglePreference('enabled')}
        />
        
        <SettingRow
          icon="brain"
          title="Notificações Inteligentes"
          subtitle="IA aprende seus melhores horários"
          value={preferences.smartNotifications}
          onToggle={() => togglePreference('smartNotifications')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="clock-outline"
          title="Lembrete Diário"
          subtitle={`Todos os dias às ${formatTime(preferences.dailyReminderTime)}`}
          value={preferences.dailyReminder}
          onToggle={() => togglePreference('dailyReminder')}
          onPress={() => preferences.dailyReminder && setShowTimePicker('dailyReminderTime')}
          disabled={!preferences.enabled}
        />
      </View>

      {/* Tipos de Notificação */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tipos de Notificação
        </Text>
        
        <SettingRow
          icon="fire"
          title="Alerta de Sequência"
          subtitle="Avisa quando streak está em risco"
          value={preferences.streakReminder}
          onToggle={() => togglePreference('streakReminder')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="trophy"
          title="Conquistas"
          subtitle="Celebre suas vitórias"
          value={preferences.achievementNotifications}
          onToggle={() => togglePreference('achievementNotifications')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="format-quote-close"
          title="Frases Motivacionais"
          subtitle="Inspiração diária"
          value={preferences.motivationalQuotes}
          onToggle={() => togglePreference('motivationalQuotes')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="chart-line"
          title="Relatório Semanal"
          subtitle="Resumo do seu progresso"
          value={preferences.weeklyReport}
          onToggle={() => togglePreference('weeklyReport')}
          disabled={!preferences.enabled}
        />
      </View>

      {/* Frequência */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Frequência de Notificações
        </Text>
        
        <View style={styles.frequencyContainer}>
          {(['minimal', 'balanced', 'aggressive'] as const).map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyOption,
                preferences.notificationFrequency === freq && styles.frequencyOptionActive,
                { 
                  borderColor: preferences.notificationFrequency === freq 
                    ? theme.colors.primary 
                    : theme.colors.border 
                }
              ]}
              onPress={() => setFrequency(freq)}
              disabled={!preferences.enabled}
            >
              <Icon
                name={
                  freq === 'minimal' ? 'bell-off' : 
                  freq === 'balanced' ? 'bell' : 'bell-ring'
                }
                size={24}
                color={
                  preferences.notificationFrequency === freq 
                    ? theme.colors.primary 
                    : theme.colors.textSecondary
                }
              />
              <Text style={[
                styles.frequencyText,
                {
                  color: preferences.notificationFrequency === freq 
                    ? theme.colors.primary 
                    : theme.colors.text
                }
              ]}>
                {freq === 'minimal' ? 'Mínima' : 
                 freq === 'balanced' ? 'Equilibrada' : 'Máxima'}
              </Text>
              <Text style={[styles.frequencyDescription, { color: theme.colors.textSecondary }]}>
                {freq === 'minimal' ? 'Apenas essencial' : 
                 freq === 'balanced' ? 'Recomendado' : 'Todas as features'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Configurações Avançadas */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Configurações Avançadas
        </Text>
        
        <SettingRow
          icon="volume-high"
          title="Som"
          subtitle="Tocar sons nas notificações"
          value={preferences.soundEnabled}
          onToggle={() => togglePreference('soundEnabled')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="vibrate"
          title="Vibração"
          subtitle="Vibrar ao receber notificações"
          value={preferences.vibrationEnabled}
          onToggle={() => togglePreference('vibrationEnabled')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="moon-waning-crescent"
          title="Horário de Silêncio"
          subtitle={
            preferences.quietHoursEnabled 
              ? `${formatTime(preferences.quietHoursStart)} - ${formatTime(preferences.quietHoursEnd)}`
              : 'Desativado'
          }
          value={preferences.quietHoursEnabled}
          onToggle={() => togglePreference('quietHoursEnabled')}
          disabled={!preferences.enabled}
        />
        
        <SettingRow
          icon="cellphone-cog"
          title="Configurações do Sistema"
          subtitle="Gerenciar permissões do app"
          showArrow
          onPress={openSystemSettings}
        />
      </View>

      {/* Time Pickers */}
      {showTimePicker === 'dailyReminderTime' && (
        <DateTimePicker
          value={preferences.dailyReminderTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(e, date) => setTime(e, date, 'dailyReminderTime')}
        />
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  insightsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingRowDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  frequencyContainer: {
    padding: 20,
  },
  frequencyOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  frequencyOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  frequencyDescription: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default NotificationSettingsScreen;