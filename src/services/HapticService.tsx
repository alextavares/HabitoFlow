import { Platform } from 'react-native';

// Temporary mock for web platform
// In a real app, you would use react-native-haptic-feedback library

interface HapticFeedbackType {
  impact: (style?: 'light' | 'medium' | 'heavy') => void;
  selection: () => void;
  notification: (type?: 'success' | 'warning' | 'error') => void;
}

export const HapticFeedback: HapticFeedbackType = {
  impact: (style = 'medium') => {
    if (Platform.OS === 'web') {
      // For web, we can simulate with a visual feedback
      console.log(`Haptic feedback: impact ${style}`);
      return;
    }
    
    // On mobile, this would trigger actual haptic feedback
    // Using react-native-haptic-feedback library
    try {
      // Import would be at the top in real implementation
      // const ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
      // ReactNativeHapticFeedback.impact(
      //   style === 'light' 
      //     ? ReactNativeHapticFeedback.ImpactFeedbackStyle.Light
      //     : style === 'heavy'
      //     ? ReactNativeHapticFeedback.ImpactFeedbackStyle.Heavy
      //     : ReactNativeHapticFeedback.ImpactFeedbackStyle.Medium
      // );
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  },

  selection: () => {
    if (Platform.OS === 'web') {
      console.log('Haptic feedback: selection');
      return;
    }
    
    try {
      // ReactNativeHapticFeedback.selection();
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  },

  notification: (type = 'success') => {
    if (Platform.OS === 'web') {
      console.log(`Haptic feedback: notification ${type}`);
      return;
    }
    
    try {
      // const notificationType = 
      //   type === 'success' 
      //     ? ReactNativeHapticFeedback.NotificationFeedbackType.Success
      //     : type === 'warning'
      //     ? ReactNativeHapticFeedback.NotificationFeedbackType.Warning
      //     : ReactNativeHapticFeedback.NotificationFeedbackType.Error;
      // ReactNativeHapticFeedback.notification(notificationType);
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  },
};

// Vibration patterns for different actions
export const VibrationPatterns = {
  success: Platform.OS === 'ios' ? [0, 10, 100, 20] : [0, 50, 100, 50],
  error: Platform.OS === 'ios' ? [0, 20, 50, 20, 50] : [0, 100, 50, 100],
  warning: Platform.OS === 'ios' ? [0, 10, 20, 10] : [0, 50],
};

// Animation configurations that pair with haptic feedback
export const HapticAnimations = {
  buttonPress: {
    scale: {
      from: 1,
      to: 0.95,
      duration: 100,
    },
    opacity: {
      from: 1,
      to: 0.8,
      duration: 100,
    },
  },
  
  success: {
    scale: {
      from: 1,
      to: 1.1,
      duration: 200,
      bounce: true,
    },
  },
  
  error: {
    translateX: {
      from: 0,
      to: 10,
      duration: 100,
      loop: 3,
    },
  },
};

// Wrapper component for haptic-enabled buttons
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Animated } from 'react-native';

interface HapticButtonProps extends TouchableOpacityProps {
  hapticType?: 'selection' | 'impact' | 'notification';
  hapticStyle?: 'light' | 'medium' | 'heavy';
  children: React.ReactNode;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  hapticType = 'impact',
  hapticStyle = 'medium',
  onPress,
  children,
  ...props
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = (event: any) => {
    // Trigger haptic feedback
    if (hapticType === 'selection') {
      HapticFeedback.selection();
    } else if (hapticType === 'impact') {
      HapticFeedback.impact(hapticStyle);
    } else {
      HapticFeedback.notification('success');
    }

    // Animate button
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Call original onPress
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default HapticFeedback;