import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreenV3 from '../screens/HomeScreenV3';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  user: any;
  onLogout: () => void;
}

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
          },
          headerStyle: {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{
            title: 'Hábitos',
            tabBarLabel: 'Hábitos',
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        >
          {(props) => <HomeScreenV3 {...props} user={user} onLogout={onLogout} />}
        </Tab.Screen>

        <Tab.Screen
          name="Stats"
          options={{
            title: 'Estatísticas',
            tabBarLabel: 'Estatísticas',
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
          name="Profile"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Icon name="account" color={color} size={size} />
            ),
          }}
        >
          {(props) => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;