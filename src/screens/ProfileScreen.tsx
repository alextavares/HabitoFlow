import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { authServices, userServices } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

interface ProfileScreenProps {
  user: any;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [completedHabits, setCompletedHabits] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadUserData();
    checkNotificationStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await userServices.getUserProfile(user.uid);
      setUserData(data);
      
      // Calcular streak e hábitos completados
      const userStreak = await AsyncStorage.getItem(`@streak_${user.uid}`);
      if (userStreak) setStreak(parseInt(userStreak));
      
      const habits = await userServices.getUserHabits(user.uid);
      const completed = habits.filter((h: any) => h.completed).length;
      setCompletedHabits(completed);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    const hasPermission = await NotificationService.checkPermission();
    setNotificationsEnabled(hasPermission);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const token = await NotificationService.requestPermission();
      if (token) {
        setNotificationsEnabled(true);
        Alert.alert('Sucesso', 'Notificações habilitadas com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível habilitar as notificações');
      }
    } else {
      Alert.alert(
        'Desabilitar Notificações',
        'Para desabilitar as notificações, vá para as configurações do seu dispositivo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await authServices.deleteAccount();
              Alert.alert('Sucesso', 'Conta excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a conta');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.profileInitial}>
                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {user.displayName || 'Usuário'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {user.email}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="fire" size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Dias de Sequência</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={24} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{completedHabits}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Hábitos Completados</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Configurações</Text>
        
        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={toggleTheme}
        >
          <View style={styles.optionLeft}>
            <Icon name={theme.dark ? 'weather-sunny' : 'weather-night'} size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Tema Escuro</Text>
          </View>
          <Icon name={theme.dark ? 'toggle-switch' : 'toggle-switch-off'} size={40} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={toggleNotifications}
        >
          <View style={styles.optionLeft}>
            <Icon name="bell" size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Notificações</Text>
          </View>
          <Icon 
            name={notificationsEnabled ? 'toggle-switch' : 'toggle-switch-off'} 
            size={40} 
            color={notificationsEnabled ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Versão', 'HabitoFlow v1.0.0')}
        >
          <View style={styles.optionLeft}>
            <Icon name="information" size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Sobre</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Conta</Text>
        
        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={onLogout}
        >
          <View style={styles.optionLeft}>
            <Icon name="logout" size={24} color={theme.colors.primary} />
            <Text style={[styles.optionText, { color: theme.colors.text }]}>Sair</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionItem, { backgroundColor: theme.colors.card }]}
          onPress={handleDeleteAccount}
        >
          <View style={styles.optionLeft}>
            <Icon name="delete" size={24} color="#FF6B6B" />
            <Text style={[styles.optionText, { color: '#FF6B6B' }]}>Excluir Conta</Text>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ProfileScreen;