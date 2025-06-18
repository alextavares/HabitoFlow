import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface AnimatedCheckboxProps {
  checked: boolean;
  color: string;
  size?: number;
}

const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ 
  checked, 
  color, 
  size = 40 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (checked) {
      // Animação quando marcar
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 400,
          delay: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Animação quando desmarcar
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [checked]);

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Círculo de fundo */}
      <View 
        style={[
          styles.circle, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            backgroundColor: checked ? color : '#E5E7EB',
          }
        ]} 
      />
      
      {/* Círculo animado */}
      <Animated.View
        style={[
          styles.animatedCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale }, { rotate }],
          },
        ]}
      />
      
      {/* Checkmark SVG */}
      <AnimatedSvg
        width={size * 0.6}
        height={size * 0.6}
        style={[styles.checkmark, { opacity: checkmarkAnim }]}
        viewBox="0 0 24 24"
      >
        <AnimatedPath
          d="M4 12l5 5L20 6"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="24"
          strokeDashoffset={checkmarkAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [24, 0],
          })}
        />
      </AnimatedSvg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  animatedCircle: {
    position: 'absolute',
  },
  checkmark: {
    position: 'absolute',
  },
});

export default AnimatedCheckbox;