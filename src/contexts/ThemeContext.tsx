import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  // Cores principais
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Cores de status
  success: string;
  warning: string;
  danger: string;
  
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  
  // Textos
  text: string;
  textSecondary: string;
  textInverse: string;
  
  // Bordas e divisores
  border: string;
  divider: string;
  
  // Glassmorphism
  glass: string;
  glassBackground: string;
  glassBorder: string;
  
  // Sombras
  shadowColor: string;
  shadowOpacity: number;
  
  // Status bar
  statusBar: 'light-content' | 'dark-content';
}

const lightTheme: Theme = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: 'rgba(255, 255, 255, 0.7)',
  
  text: '#111827',
  textSecondary: '#6B7280',
  textInverse: '#FFFFFF',
  
  border: '#E5E7EB',
  divider: '#E5E7EB',
  
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBackground: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  
  shadowColor: '#000',
  shadowOpacity: 0.1,
  
  statusBar: 'dark-content',
};

const darkTheme: Theme = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  
  background: '#0F172A',
  surface: '#1E293B',
  card: 'rgba(30, 41, 59, 0.7)',
  
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textInverse: '#111827',
  
  border: '#334155',
  divider: '#334155',
  
  glass: 'rgba(30, 41, 59, 0.7)',
  glassBackground: 'rgba(30, 41, 59, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  shadowColor: '#000',
  shadowOpacity: 0.3,
  
  statusBar: 'light-content',
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use o tema do sistema como padrão
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('themePreference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
    saveThemePreference(isDark);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Hook helper para estilos temáticos
export const useThemedStyles = <T extends (...args: any[]) => any>(
  stylesFn: (theme: Theme, isDarkMode: boolean) => ReturnType<T>
): ReturnType<T> => {
  const { theme, isDarkMode } = useTheme();
  return stylesFn(theme, isDarkMode);
};