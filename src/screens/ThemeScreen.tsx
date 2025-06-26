import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeService, Theme, defaultThemes, premiumThemes } from '../services/ThemeService';
import { HapticFeedback } from '../services/HapticService';
import { ScalePress, FadeInView } from '../components/AnimatedComponents';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ThemeScreenProps {
  navigation: any;
}

const ThemeScreen: React.FC<ThemeScreenProps> = ({ navigation }) => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState<string>('light');
  const [purchasedThemes, setPurchasedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadThemeData();
  }, []);

  const loadThemeData = async () => {
    try {
      const current = await ThemeService.getCurrentTheme();
      setSelectedThemeId(current.id);
      
      const purchased = await ThemeService.getPurchasedThemes();
      setPurchasedThemes(purchased);
    } catch (error) {
      console.error('Error loading theme data:', error);
    }
  };

  const handleThemeSelect = async (theme: Theme) => {
    HapticFeedback.selection();
    
    if (theme.isPremium && !purchasedThemes.includes(theme.id)) {
      // Show purchase dialog
      Alert.alert(
        '🎨 Tema Premium',
        `Deseja comprar o tema "${theme.name}" por R$ ${theme.price?.toFixed(2)}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Comprar',
            onPress: () => handlePurchaseTheme(theme),
          },
        ]
      );
      return;
    }
    
    // Apply theme
    applyTheme(theme);
  };

  const handlePurchaseTheme = async (theme: Theme) => {
    setLoading(true);
    HapticFeedback.impact('medium');
    
    try {
      // Simulate purchase
      const success = await ThemeService.purchaseTheme(theme.id);
      
      if (success) {
        // Update purchased list
        const newPurchased = [...purchasedThemes, theme.id];
        setPurchasedThemes(newPurchased);
        
        // Apply theme
        applyTheme(theme);
        
        Alert.alert(
          '✅ Compra Realizada!',
          `O tema "${theme.name}" foi adquirido com sucesso!`
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a compra.');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = async (theme: Theme) => {
    setSelectedThemeId(theme.id);
    await ThemeService.setCurrentTheme(theme.id);
    setTheme(theme);
    HapticFeedback.notification('success');
  };

  const renderThemeCard = (theme: Theme, index: number) => {
    const isSelected = selectedThemeId === theme.id;
    const isPurchased = !theme.isPremium || purchasedThemes.includes(theme.id);
    
    return (
      <FadeInView
        key={theme.id}
        delay={index * 100}
        style={styles.cardContainer}
      >
        <ScalePress
          onPress={() => handleThemeSelect(theme)}
          scale={0.96}
        >
          <View
            style={[
              styles.themeCard,
              isSelected && styles.selectedCard,
              {
                borderColor: isSelected 
                  ? theme.colors.primary 
                  : currentTheme.colors.border,
              },
            ]}
          >
            {/* Theme Preview */}
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              style={styles.themePreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.previewContent}>
                {/* Mini UI Preview */}
                <View
                  style={[
                    styles.miniHeader,
                    { backgroundColor: theme.colors.surface + '80' },
                  ]}
                />
                <View style={styles.miniCards}>
                  <View
                    style={[
                      styles.miniCard,
                      { backgroundColor: theme.colors.card + '80' },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniCard,
                      { backgroundColor: theme.colors.card + '80' },
                    ]}
                  />
                </View>
              </View>
              
              {/* Premium Badge */}
              {theme.isPremium && !isPurchased && (
                <View style={styles.premiumBadge}>
                  <Icon name="crown" size={16} color="#FFD700" />
                </View>
              )}
              
              {/* Selected Check */}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Icon name="check-circle" size={24} color="white" />
                </View>
              )}
            </LinearGradient>
            
            {/* Theme Info */}
            <View style={styles.themeInfo}>
              <Text
                style={[
                  styles.themeName,
                  { color: currentTheme.colors.text },
                ]}
              >
                {theme.name}
              </Text>
              
              {theme.isPremium && !isPurchased ? (
                <Text
                  style={[
                    styles.themePrice,
                    { color: currentTheme.colors.primary },
                  ]}
                >
                  R$ {theme.price?.toFixed(2)}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.themeStatus,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {isPurchased ? 'Disponível' : 'Gratuito'}
                </Text>
              )}
            </View>
          </View>
        </ScalePress>
      </FadeInView>
    );
  };

  const allThemes = [
    ...Object.values(defaultThemes),
    ...Object.values(premiumThemes),
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[currentTheme.colors.primary, currentTheme.colors.accent]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon name="palette" size={48} color="white" />
          <Text style={styles.headerTitle}>Loja de Temas</Text>
          <Text style={styles.headerSubtitle}>
            Personalize sua experiência
          </Text>
        </LinearGradient>
      </View>

      {/* Auto Theme Switch */}
      <TouchableOpacity
        style={[
          styles.autoThemeCard,
          {
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
          },
        ]}
        onPress={() => navigation.navigate('ThemeSettings')}
      >
        <View style={styles.autoThemeContent}>
          <Icon
            name="theme-light-dark"
            size={24}
            color={currentTheme.colors.primary}
          />
          <View style={styles.autoThemeText}>
            <Text
              style={[
                styles.autoThemeTitle,
                { color: currentTheme.colors.text },
              ]}
            >
              Tema Automático
            </Text>
            <Text
              style={[
                styles.autoThemeSubtitle,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Alterna entre claro e escuro
            </Text>
          </View>
        </View>
        <Icon
          name="chevron-right"
          size={24}
          color={currentTheme.colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Free Themes */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: currentTheme.colors.text },
          ]}
        >
          Temas Gratuitos
        </Text>
        <View style={styles.themesGrid}>
          {Object.values(defaultThemes).map((theme, index) =>
            renderThemeCard(theme, index)
          )}
        </View>
      </View>

      {/* Premium Themes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: currentTheme.colors.text },
            ]}
          >
            Temas Premium
          </Text>
          <Icon name="crown" size={20} color="#FFD700" />
        </View>
        <View style={styles.themesGrid}>
          {Object.values(premiumThemes).map((theme, index) =>
            renderThemeCard(theme, index + Object.keys(defaultThemes).length)
          )}
        </View>
      </View>

      {/* Premium Benefits */}
      <LinearGradient
        colors={[currentTheme.colors.primary + '20', currentTheme.colors.accent + '20']}
        style={styles.benefitsCard}
      >
        <Icon name="star" size={32} color={currentTheme.colors.primary} />
        <Text
          style={[
            styles.benefitsTitle,
            { color: currentTheme.colors.text },
          ]}
        >
          Benefícios Premium
        </Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Icon
              name="check"
              size={16}
              color={currentTheme.colors.success}
            />
            <Text
              style={[
                styles.benefitText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Temas exclusivos e únicos
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="check"
              size={16}
              color={currentTheme.colors.success}
            />
            <Text
              style={[
                styles.benefitText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Efeitos especiais (neon, glassmorphism)
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              name="check"
              size={16}
              color={currentTheme.colors.success}
            />
            <Text
              style={[
                styles.benefitText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              Atualizações mensais com novos temas
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  autoThemeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoThemeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoThemeText: {
    marginLeft: 12,
  },
  autoThemeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  autoThemeSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  themeCard: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 3,
  },
  themePreview: {
    height: 120,
    position: 'relative',
  },
  previewContent: {
    flex: 1,
    padding: 12,
  },
  miniHeader: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  miniCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    width: '48%',
    height: 30,
    borderRadius: 6,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  selectedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  themeInfo: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  themePrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  themeStatus: {
    fontSize: 13,
    marginTop: 4,
  },
  benefitsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
  },
  benefitsList: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default ThemeScreen;