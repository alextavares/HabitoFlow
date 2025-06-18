import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  colors?: string[];
  particleCount?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isActive,
  colors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
  particleCount = 50,
  duration = 3000,
  onAnimationComplete,
}) => {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      createParticles();
      animateParticles();
    }
  }, [isActive]);

  const createParticles = () => {
    particles.current = Array.from({ length: particleCount }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-100),
      rotation: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 15 + 10,
    }));
  };

  const animateParticles = () => {
    const animations = particles.current.map((particle) => {
      const horizontalMovement = Math.random() * 200 - 100;
      const fallDuration = Math.random() * 1000 + duration;

      return Animated.parallel([
        // Queda vertical
        Animated.timing(particle.y, {
          toValue: height + 100,
          duration: fallDuration,
          easing: Easing.quad,
          useNativeDriver: true,
        }),
        // Movimento horizontal
        Animated.timing(particle.x, {
          toValue: particle.x._value + horizontalMovement,
          duration: fallDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Rotação
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 720 - 360,
          duration: fallDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: fallDuration * 0.8,
          delay: fallDuration * 0.2,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onAnimationComplete?.();
    });
  };

  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 4,
  },
});

export default ConfettiCelebration;