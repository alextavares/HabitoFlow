import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import GamificationService, { Achievement, UserLevel } from '../services/GamificationService';

const { width } = Dimensions.get('window');

interface AchievementsScreenProps {
  user: any;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ user }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<UserLevel | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked'>('all');

  useEffect(() => {
    GamificationService.setUserId(user.uid);
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      const stats = await GamificationService.getUserStats();
      if (stats) {
        setPoints(stats.points);
        setAchievements(stats.achievements);
        setUserLevel(stats.level);
        setNextLevel(stats.nextLevel);
        setProgress(stats.progress);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementsByType = (type: string) => {
    return achievements.filter(a => a.type === type);
  };

  const filteredAchievements = selectedTab === 'unlocked' 
    ? achievements.filter(a => a.unlocked)
    : achievements;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com nível */}
      <LinearGradient
        colors={['#6366F1', '#818CF8']}
        style={styles.header}
      >
        <View style={styles.levelContainer}>
          <Text style={styles.levelNumber}>Nível {userLevel?.level}</Text>
          <Text style={styles.levelTitle}>{userLevel?.title}</Text>
          <View style={styles.pointsContainer}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.points}>{points} pontos</Text>
          </View>
        </View>
        
        {nextLevel && (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>Progresso para o próximo nível</Text>
              <Text style={styles.progressPoints}>
                {points - (userLevel?.minPoints || 0)} / {(nextLevel.minPoints - (userLevel?.minPoints || 0))}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progress}%` }]} 
              />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Estatísticas gerais */}
      <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Conquistas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{unlockedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Desbloqueadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalCount}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{completionPercentage}%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completo</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'all' && styles.activeTab,
            { borderBottomColor: selectedTab === 'all' ? theme.colors.primary : 'transparent' }
          ]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'all' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'unlocked' && styles.activeTab,
            { borderBottomColor: selectedTab === 'unlocked' ? theme.colors.primary : 'transparent' }
          ]}
          onPress={() => setSelectedTab('unlocked')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'unlocked' ? theme.colors.primary : theme.colors.textSecondary }
          ]}>
            Desbloqueadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de conquistas */}
      <View style={styles.achievementsList}>
        {['streak', 'habits', 'completion', 'special'].map((type) => {
          const typeAchievements = filteredAchievements.filter(a => a.type === type);
          if (typeAchievements.length === 0) return null;

          return (
            <View key={type} style={styles.achievementSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {type === 'streak' && 'Sequências'}
                {type === 'habits' && 'Hábitos'}
                {type === 'completion' && 'Completude'}
                {type === 'special' && 'Especiais'}
              </Text>
              
              {typeAchievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    { 
                      backgroundColor: theme.colors.card,
                      opacity: achievement.unlocked ? 1 : 0.6,
                    }
                  ]}
                >
                  <View style={styles.achievementIcon}>
                    <Text style={styles.iconEmoji}>{achievement.icon}</Text>
                    {achievement.unlocked && (
                      <Icon 
                        name="check-circle" 
                        size={20} 
                        color={theme.colors.success} 
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                  
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>
                      {achievement.title}
                    </Text>
                    <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
                      {achievement.description}
                    </Text>
                    <View style={styles.achievementFooter}>
                      <View style={styles.pointsBadge}>
                        <Icon name="star" size={14} color="#FFD700" />
                        <Text style={styles.achievementPoints}>{achievement.points}</Text>
                      </View>
                      {achievement.unlockedAt && (
                        <Text style={[styles.unlockedDate, { color: theme.colors.textSecondary }]}>
                          {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  points: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressPoints: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  achievementSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  iconEmoji: {
    fontSize: 36,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  unlockedDate: {
    fontSize: 12,
  },
});

export default AchievementsScreen;