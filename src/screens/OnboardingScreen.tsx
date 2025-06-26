import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface SlideData {
  key: string;
  title: string;
  text: string;
  icon: string;
  gradient: string[];
}

const slides: SlideData[] = [
  {
    key: '1',
    title: 'Crie Hábitos Saudáveis',
    text: 'Transforme pequenas ações diárias em grandes mudanças de vida',
    icon: 'target',
    gradient: ['#6366F1', '#8B5CF6'],
  },
  {
    key: '2',
    title: 'Acompanhe seu Progresso',
    text: 'Visualize suas conquistas com gráficos e estatísticas detalhadas',
    icon: 'chart-line',
    gradient: ['#8B5CF6', '#A855F7'],
  },
  {
    key: '3',
    title: 'Mantenha-se Motivado',
    text: 'Ganhe pontos, desbloqueie conquistas e supere seus recordes',
    icon: 'trophy',
    gradient: ['#A855F7', '#C084FC'],
  },
  {
    key: '4',
    title: 'Notificações Inteligentes',
    text: 'Lembretes personalizados para nunca perder um dia',
    icon: 'bell-ring',
    gradient: ['#C084FC', '#E879F9'],
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      onComplete();
    }
  };

  const skip = () => {
    handleComplete();
  };

  const renderItem = ({ item, index }: { item: SlideData; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={styles.gradientCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              transform: [{ scale }],
              opacity,
            }}
          >
            <Icon name={item.icon} size={80} color="white" />
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </Animated.View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <Animated.FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.key}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        <Paginator />
        
        <TouchableOpacity style={styles.nextButton} onPress={scrollTo}>
          <LinearGradient
            colors={slides[currentIndex].gradient}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <Icon 
              name={currentIndex === slides.length - 1 ? 'check' : 'arrow-right'} 
              size={20} 
              color="white" 
              style={styles.nextIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 3,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  gradientCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    marginHorizontal: 8,
  },
  nextButton: {
    marginHorizontal: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  nextIcon: {
    marginLeft: 8,
  },
});

export default OnboardingScreen;