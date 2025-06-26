import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  id: string;
  name: string;
  isPremium: boolean;
  price?: number;
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textInverse: string;
    
    // State colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // UI elements
    border: string;
    divider: string;
    card: string;
    
    // Special effects
    shadow: string;
    overlay: string;
    
    // Gradients
    gradientStart: string;
    gradientEnd: string;
  };
  
  // Typography
  typography?: {
    fontFamily?: string;
    headerFont?: string;
  };
  
  // Special effects
  effects?: {
    blur?: number;
    glassmorphism?: boolean;
    neonGlow?: boolean;
    parallax?: boolean;
  };
}

// Temas gratuitos
export const defaultThemes: { [key: string]: Theme } = {
  light: {
    id: 'light',
    name: 'Claro',
    isPremium: false,
    colors: {
      primary: '#6366F1',
      primaryLight: '#818CF8',
      primaryDark: '#4F46E5',
      accent: '#8B5CF6',
      accentLight: '#A78BFA',
      accentDark: '#7C3AED',
      background: '#F9FAFB',
      backgroundSecondary: '#F3F4F6',
      surface: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      textInverse: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#E5E7EB',
      divider: '#E5E7EB',
      card: '#FFFFFF',
      shadow: '#000000',
      overlay: 'rgba(0, 0, 0, 0.5)',
      gradientStart: '#6366F1',
      gradientEnd: '#8B5CF6',
    },
  },
  
  dark: {
    id: 'dark',
    name: 'Escuro',
    isPremium: false,
    colors: {
      primary: '#818CF8',
      primaryLight: '#A5B4FC',
      primaryDark: '#6366F1',
      accent: '#A78BFA',
      accentLight: '#C4B5FD',
      accentDark: '#8B5CF6',
      background: '#0F172A',
      backgroundSecondary: '#1E293B',
      surface: '#1E293B',
      text: '#F3F4F6',
      textSecondary: '#94A3B8',
      textInverse: '#111827',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      border: '#334155',
      divider: '#334155',
      card: '#1E293B',
      shadow: '#000000',
      overlay: 'rgba(0, 0, 0, 0.7)',
      gradientStart: '#818CF8',
      gradientEnd: '#A78BFA',
    },
  },
};

// Temas Premium
export const premiumThemes: { [key: string]: Theme } = {
  midnight: {
    id: 'midnight',
    name: 'Meia-Noite',
    isPremium: true,
    price: 4.90,
    colors: {
      primary: '#3730A3',
      primaryLight: '#4C1D95',
      primaryDark: '#312E81',
      accent: '#7C3AED',
      accentLight: '#8B5CF6',
      accentDark: '#6D28D9',
      background: '#0C0E1A',
      backgroundSecondary: '#161829',
      surface: '#1E2139',
      text: '#E0E7FF',
      textSecondary: '#A5B4FC',
      textInverse: '#1E1B4B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      border: '#312E81',
      divider: '#312E81',
      card: '#1E2139',
      shadow: '#000000',
      overlay: 'rgba(12, 14, 26, 0.8)',
      gradientStart: '#312E81',
      gradientEnd: '#7C3AED',
    },
    effects: {
      glassmorphism: true,
      neonGlow: true,
    },
  },
  
  forest: {
    id: 'forest',
    name: 'Floresta',
    isPremium: true,
    price: 4.90,
    colors: {
      primary: '#059669',
      primaryLight: '#10B981',
      primaryDark: '#047857',
      accent: '#84CC16',
      accentLight: '#A3E635',
      accentDark: '#65A30D',
      background: '#F0FDF4',
      backgroundSecondary: '#ECFDF5',
      surface: '#FFFFFF',
      text: '#022C22',
      textSecondary: '#14532D',
      textInverse: '#FFFFFF',
      success: '#22C55E',
      warning: '#EAB308',
      error: '#DC2626',
      info: '#0EA5E9',
      border: '#86EFAC',
      divider: '#BBF7D0',
      card: '#F0FDF4',
      shadow: '#064E3B',
      overlay: 'rgba(6, 78, 59, 0.5)',
      gradientStart: '#059669',
      gradientEnd: '#84CC16',
    },
  },
  
  ocean: {
    id: 'ocean',
    name: 'Oceano',
    isPremium: true,
    price: 4.90,
    colors: {
      primary: '#0891B2',
      primaryLight: '#06B6D4',
      primaryDark: '#0E7490',
      accent: '#6366F1',
      accentLight: '#818CF8',
      accentDark: '#4F46E5',
      background: '#F0F9FF',
      backgroundSecondary: '#E0F2FE',
      surface: '#FFFFFF',
      text: '#0C4A6E',
      textSecondary: '#075985',
      textInverse: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      border: '#7DD3FC',
      divider: '#BAE6FD',
      card: '#F0F9FF',
      shadow: '#075985',
      overlay: 'rgba(7, 89, 133, 0.5)',
      gradientStart: '#0891B2',
      gradientEnd: '#6366F1',
    },
  },
  
  sunset: {
    id: 'sunset',
    name: 'Pôr do Sol',
    isPremium: true,
    price: 4.90,
    colors: {
      primary: '#DC2626',
      primaryLight: '#EF4444',
      primaryDark: '#B91C1C',
      accent: '#F59E0B',
      accentLight: '#FCD34D',
      accentDark: '#D97706',
      background: '#FEF3C7',
      backgroundSecondary: '#FEF3C7',
      surface: '#FFFBEB',
      text: '#451A03',
      textSecondary: '#78350F',
      textInverse: '#FFFFFF',
      success: '#059669',
      warning: '#EA580C',
      error: '#991B1B',
      info: '#1E40AF',
      border: '#FCD34D',
      divider: '#FDE68A',
      card: '#FFFBEB',
      shadow: '#78350F',
      overlay: 'rgba(120, 53, 15, 0.5)',
      gradientStart: '#DC2626',
      gradientEnd: '#F59E0B',
    },
  },
  
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    isPremium: true,
    price: 9.90,
    colors: {
      primary: '#F0F',
      primaryLight: '#FF4FFF',
      primaryDark: '#CC00CC',
      accent: '#0FF',
      accentLight: '#4FFFFF',
      accentDark: '#00CCCC',
      background: '#0A0A0A',
      backgroundSecondary: '#1A1A1A',
      surface: '#2A2A2A',
      text: '#F0F0F0',
      textSecondary: '#B0B0B0',
      textInverse: '#0A0A0A',
      success: '#0F0',
      warning: '#FF0',
      error: '#F00',
      info: '#00F',
      border: '#F0F',
      divider: '#404040',
      card: '#1A1A1A',
      shadow: '#F0F',
      overlay: 'rgba(255, 0, 255, 0.3)',
      gradientStart: '#F0F',
      gradientEnd: '#0FF',
    },
    effects: {
      neonGlow: true,
      glassmorphism: true,
    },
  },
  
  minimalist: {
    id: 'minimalist',
    name: 'Minimalista',
    isPremium: true,
    price: 4.90,
    colors: {
      primary: '#000000',
      primaryLight: '#404040',
      primaryDark: '#000000',
      accent: '#000000',
      accentLight: '#404040',
      accentDark: '#000000',
      background: '#FFFFFF',
      backgroundSecondary: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      textInverse: '#FFFFFF',
      success: '#000000',
      warning: '#666666',
      error: '#000000',
      info: '#404040',
      border: '#E0E0E0',
      divider: '#F0F0F0',
      card: '#FAFAFA',
      shadow: '#000000',
      overlay: 'rgba(0, 0, 0, 0.1)',
      gradientStart: '#FFFFFF',
      gradientEnd: '#F0F0F0',
    },
    typography: {
      fontFamily: 'Helvetica',
    },
  },
  
  retrowave: {
    id: 'retrowave',
    name: 'Retrowave',
    isPremium: true,
    price: 9.90,
    colors: {
      primary: '#FF006E',
      primaryLight: '#FF4A92',
      primaryDark: '#CC0058',
      accent: '#8338EC',
      accentLight: '#A663F5',
      accentDark: '#6A2BC9',
      background: '#1A0033',
      backgroundSecondary: '#2D0052',
      surface: '#3F0071',
      text: '#FFADFF',
      textSecondary: '#FF71CE',
      textInverse: '#1A0033',
      success: '#3BFFB8',
      warning: '#FFBE0B',
      error: '#FB5607',
      info: '#06FFA5',
      border: '#FF006E',
      divider: '#8338EC',
      card: '#3F0071',
      shadow: '#FF006E',
      overlay: 'rgba(255, 0, 110, 0.3)',
      gradientStart: '#FF006E',
      gradientEnd: '#8338EC',
    },
    effects: {
      neonGlow: true,
      parallax: true,
    },
  },
};

// Serviço de gerenciamento de temas
export class ThemeService {
  private static readonly CURRENT_THEME_KEY = '@current_theme';
  private static readonly PURCHASED_THEMES_KEY = '@purchased_themes';
  private static readonly THEME_PREFERENCES_KEY = '@theme_preferences';

  // Obter tema atual
  static async getCurrentTheme(): Promise<Theme> {
    try {
      const themeId = await AsyncStorage.getItem(this.CURRENT_THEME_KEY);
      
      if (!themeId) {
        return defaultThemes.light;
      }
      
      // Verificar se é um tema padrão
      if (defaultThemes[themeId]) {
        return defaultThemes[themeId];
      }
      
      // Verificar se é um tema premium comprado
      const purchasedThemes = await this.getPurchasedThemes();
      if (purchasedThemes.includes(themeId) && premiumThemes[themeId]) {
        return premiumThemes[themeId];
      }
      
      // Fallback para tema padrão
      return defaultThemes.light;
    } catch (error) {
      console.error('Error getting current theme:', error);
      return defaultThemes.light;
    }
  }

  // Definir tema atual
  static async setCurrentTheme(themeId: string): Promise<boolean> {
    try {
      // Verificar se o tema existe
      const theme = this.getThemeById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }
      
      // Se for premium, verificar se foi comprado
      if (theme.isPremium) {
        const purchased = await this.isThemePurchased(themeId);
        if (!purchased) {
          throw new Error('Theme not purchased');
        }
      }
      
      await AsyncStorage.setItem(this.CURRENT_THEME_KEY, themeId);
      return true;
    } catch (error) {
      console.error('Error setting theme:', error);
      return false;
    }
  }

  // Obter todos os temas disponíveis
  static getAllThemes(): Theme[] {
    return [
      ...Object.values(defaultThemes),
      ...Object.values(premiumThemes),
    ];
  }

  // Obter tema por ID
  static getThemeById(themeId: string): Theme | null {
    return defaultThemes[themeId] || premiumThemes[themeId] || null;
  }

  // Verificar se um tema foi comprado
  static async isThemePurchased(themeId: string): Promise<boolean> {
    try {
      const purchasedThemes = await this.getPurchasedThemes();
      return purchasedThemes.includes(themeId);
    } catch (error) {
      console.error('Error checking theme purchase:', error);
      return false;
    }
  }

  // Obter lista de temas comprados
  static async getPurchasedThemes(): Promise<string[]> {
    try {
      const purchased = await AsyncStorage.getItem(this.PURCHASED_THEMES_KEY);
      return purchased ? JSON.parse(purchased) : [];
    } catch (error) {
      console.error('Error getting purchased themes:', error);
      return [];
    }
  }

  // Comprar tema
  static async purchaseTheme(themeId: string): Promise<boolean> {
    try {
      const theme = premiumThemes[themeId];
      if (!theme) {
        throw new Error('Theme not found');
      }
      
      // Aqui seria a integração com o sistema de pagamento
      // Por enquanto, apenas simula a compra
      
      const purchasedThemes = await this.getPurchasedThemes();
      if (!purchasedThemes.includes(themeId)) {
        purchasedThemes.push(themeId);
        await AsyncStorage.setItem(
          this.PURCHASED_THEMES_KEY,
          JSON.stringify(purchasedThemes)
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error purchasing theme:', error);
      return false;
    }
  }

  // Obter preferências de tema
  static async getThemePreferences(): Promise<any> {
    try {
      const prefs = await AsyncStorage.getItem(this.THEME_PREFERENCES_KEY);
      return prefs ? JSON.parse(prefs) : {
        autoSwitchByTime: false,
        dayTheme: 'light',
        nightTheme: 'dark',
        switchTime: { day: 6, night: 18 },
      };
    } catch (error) {
      console.error('Error getting theme preferences:', error);
      return {};
    }
  }

  // Salvar preferências de tema
  static async saveThemePreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.THEME_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }

  // Aplicar tema baseado no horário
  static async applyTimeBasedTheme(): Promise<void> {
    try {
      const prefs = await this.getThemePreferences();
      
      if (!prefs.autoSwitchByTime) return;
      
      const currentHour = new Date().getHours();
      const isDayTime = currentHour >= prefs.switchTime.day && 
                       currentHour < prefs.switchTime.night;
      
      const targetTheme = isDayTime ? prefs.dayTheme : prefs.nightTheme;
      await this.setCurrentTheme(targetTheme);
    } catch (error) {
      console.error('Error applying time-based theme:', error);
    }
  }
}

export default ThemeService;