import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ViewStyle,
  StyleProp,
  Pressable,
  View,
} from 'react-native';
import { HapticFeedback } from '../services/HapticService';

// ============= Bounce Animation Component =============
interface BounceViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const BounceView: React.FC<BounceViewProps> = ({
  children,
  delay = 0,
  duration = 1000,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: bounceAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ============= Fade In Animation Component =============
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 800,
  style,
  direction = 'up',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: translateAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(translateAnim, -1) }];
      case 'left':
        return [{ translateX: translateAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(translateAnim, -1) }];
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ============= Shake Animation Component =============
interface ShakeViewProps {
  children: React.ReactNode;
  trigger: boolean;
  style?: StyleProp<ViewStyle>;
  onShakeEnd?: () => void;
}

export const ShakeView: React.FC<ShakeViewProps> = ({
  children,
  trigger,
  style,
  onShakeEnd,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onShakeEnd) onShakeEnd();
      });
      
      HapticFeedback.notification('error');
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ============= Pulse Animation Component =============
interface PulseViewProps {
  children: React.ReactNode;
  color?: string;
  numPulses?: number;
  diameter?: number;
  speed?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  color = '#6366F1',
  numPulses = 3,
  diameter = 100,
  speed = 1000,
  duration = 3000,
  style,
}) => {
  const pulseAnims = useRef(
    [...Array(numPulses)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = pulseAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * (duration / numPulses)),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            }),
          ]),
        ])
      )
    );

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={[style, { width: diameter, height: diameter }]}>
      {pulseAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            {
              position: 'absolute',
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: color,
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 0],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          width: diameter,
          height: diameter,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
};

// ============= Scale Press Animation Component =============
interface ScalePressProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}

export const ScalePress: React.FC<ScalePressProps> = ({
  children,
  onPress,
  scale = 0.95,
  style,
  haptic = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (haptic) HapticFeedback.impact('light');
    
    Animated.spring(scaleAnim, {
      toValue: scale,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ============= Swipe Animation Component =============
interface SwipeViewProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SwipeView: React.FC<SwipeViewProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Implementação simplificada - em produção usar PanResponder
  const animateSwipe = (direction: 'left' | 'right') => {
    HapticFeedback.impact('medium');
    
    Animated.timing(translateX, {
      toValue: direction === 'left' ? -300 : 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'left' && onSwipeLeft) onSwipeLeft();
      if (direction === 'right' && onSwipeRight) onSwipeRight();
      
      // Reset position
      translateX.setValue(0);
    });
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ============= Flip Card Animation Component =============
interface FlipCardProps {
  children: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  children,
  backContent,
  isFlipped,
  style,
  duration = 800,
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      duration,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
    
    if (isFlipped) {
      HapticFeedback.impact('light');
    }
  }, [isFlipped]);

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
    backfaceVisibility: 'hidden' as const,
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
    backfaceVisibility: 'hidden' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  return (
    <View style={style}>
      <Animated.View style={[style, frontAnimatedStyle]}>
        {children}
      </Animated.View>
      <Animated.View style={[style, backAnimatedStyle]}>
        {backContent}
      </Animated.View>
    </View>
  );
};

// ============= Progress Bar Animation Component =============
interface AnimatedProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  showPercentage?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 8,
  color = '#6366F1',
  backgroundColor = '#E5E7EB',
  style,
  showPercentage = false,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false,
      speed: 2,
      bounciness: 5,
    }).start();
  }, [progress]);

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }}
      />
    </View>
  );
};

// ============= Success Check Animation =============
interface SuccessCheckProps {
  visible: boolean;
  size?: number;
  color?: string;
  onAnimationEnd?: () => void;
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({
  visible,
  size = 100,
  color = '#10B981',
  onAnimationEnd,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      HapticFeedback.notification('success');
      
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            tension: 20,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onAnimationEnd) {
          setTimeout(onAnimationEnd, 500);
        }
      });
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* SVG checkmark seria ideal aqui */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: size * 0.5,
            height: size * 0.25,
            borderLeftWidth: 4,
            borderBottomWidth: 4,
            borderColor: 'white',
            transform: [{ rotate: '-45deg' }, { translateY: -size * 0.05 }],
          }}
        />
      </View>
    </Animated.View>
  );
};

export default {
  BounceView,
  FadeInView,
  ShakeView,
  PulseView,
  ScalePress,
  SwipeView,
  FlipCard,
  AnimatedProgressBar,
  SuccessCheck,
};