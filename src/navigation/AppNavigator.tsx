import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreenV3 from '../screens/HomeScreenV3';
import DashboardScreen from '../screens/DashboardScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

interface AppNavigatorProps {
  user: any;
  onLogout: () => void;
}

// Stack Navigator para o perfil e suas sub-telas
const ProfileStack = ({ user, onLogout }: AppNavigatorProps) => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 5,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        options={{ title: 'Perfil' }}
      >
        {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
      
      <Stack.Screen 
        name="NotificationSettings" 
        options={{ 
          title: 'Notificações',
          headerLeft: () => (
            <Icon 
              name="arrow-left" 
              size={24} 
              color={theme.colors.text}
              style={{ marginLeft: 16 }}
            />
          ),
        }}
      >
        {(props) => <NotificationSettingsScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC<AppNavigatorProps> = ({ user, onLogout }) => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 20,
          },
          headerStyle: {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            elevation: 5,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarHideOnKeyboard: true,
        }}
        initialRouteName="Dashboard"
      >
        <Tab.Screen
          name="Dashboard"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Icon name="view-dashboard" color={color} size={size} />
            ),
            headerShown: false, // Dashboard has custom header
          }}
        >
          {(props) => <DashboardScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen
          name="Home"
          options={{
            title: 'Hábitos',
            tabBarLabel: 'Hábitos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="checkbox-marked-circle" color={color} size={size} />
            ),
          }}
        >
          {(props) => <HomeScreenV3 {...props} user={user} onLogout={onLogout} />}
        </Tab.Screen>

        <Tab.Screen
          name="Stats"
          options={{
            title: 'Estatísticas',
            tabBarLabel: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Icon name="chart-line" color={color} size={size} />
            ),
          }}
        >
          {(props) => <StatsScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen
          name="Achievements"
          options={{
            title: 'Conquistas',
            tabBarLabel: 'Conquistas',
            tabBarIcon: ({ color, size }) => (
              <Icon name="trophy" color={color} size={size} />
            ),
          }}
        >
          {(props) => <AchievementsScreen {...props} user={user} />}
        </Tab.Screen>

        <Tab.Screen
          name="ProfileStack"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Icon name="account" color={color} size={size} />
            ),
            headerShown: false, // Stack navigator has its own header
          }}
        >
          {() => <ProfileStack user={user} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;