import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width: customWidth = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: customWidth,
          height,
          borderRadius,
          backgroundColor: theme.isDark ? '#1E293B' : '#E5E7EB',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={
            theme.isDark
              ? ['#1E293B', '#334155', '#1E293B']
              : ['#E5E7EB', '#F3F4F6', '#E5E7EB']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

interface HabitSkeletonProps {
  count?: number;
}

export const HabitSkeleton: React.FC<HabitSkeletonProps> = ({ count = 3 }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.habitSkeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.habitCard,
            {
              backgroundColor: theme.isDark
                ? 'rgba(30, 41, 59, 0.5)'
                : 'rgba(255, 255, 255, 0.9)',
              borderColor: theme.isDark
                ? 'rgba(51, 65, 85, 0.3)'
                : 'rgba(229, 231, 235, 0.5)',
            },
          ]}
        >
          <View style={styles.habitContent}>
            <SkeletonLoader width={50} height={50} borderRadius={25} />
            <View style={styles.habitInfo}>
              <SkeletonLoader width={150} height={20} borderRadius={4} />
              <SkeletonLoader
                width={100}
                height={16}
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
            </View>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
          </View>
        </View>
      ))}
    </View>
  );
};

interface StatsSkeletonProps {}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.statsContainer}>
      {/* Header Stats */}
      <View style={styles.statsGrid}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.statCard,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(30, 41, 59, 0.5)'
                  : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          >
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <SkeletonLoader
              width={80}
              height={24}
              borderRadius={4}
              style={{ marginTop: 12 }}
            />
            <SkeletonLoader
              width={60}
              height={16}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </View>
        ))}
      </View>

      {/* Chart */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.isDark
              ? 'rgba(30, 41, 59, 0.5)'
              : 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        <SkeletonLoader width={200} height={24} borderRadius={4} />
        <SkeletonLoader
          width="100%"
          height={200}
          borderRadius={8}
          style={{ marginTop: 20 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  habitSkeletonContainer: {
    paddingHorizontal: 20,
  },
  habitCard: {
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
  },
});

export default SkeletonLoader;