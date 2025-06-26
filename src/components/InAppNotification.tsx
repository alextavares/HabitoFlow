import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { HapticFeedback } from '../services/HapticService';

const { width } = Dimensions.get('window');

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'achievement';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: string;
}

interface InAppNotificationProps {
  notification: InAppNotification | null;
  onDismiss: () => void;
}

const InAppNotificationComponent: React.FC<InAppNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const dismissTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (notification) {
      // Clear any existing timer
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }

      // Show notification
      HapticFeedback.notification('success');
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();

      // Auto dismiss
      const duration = notification.duration || 4000;
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, duration);
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleAction = () => {
    if (notification?.action) {
      HapticFeedback.selection();
      notification.action.onPress();
      handleDismiss();
    }
  };

  if (!notification) return null;

  const getColorScheme = () => {
    switch (notification.type) {
      case 'success':
        return {
          background: '#10B981',
          icon: 'check-circle',
          iconColor: 'white',
        };
      case 'error':
        return {
          background: '#EF4444',
          icon: 'alert-circle',
          iconColor: 'white',
        };
      case 'warning':
        return {
          background: '#F59E0B',
          icon: 'alert',
          iconColor: 'white',
        };
      case 'achievement':
        return {
          background: '#8B5CF6',
          icon: 'trophy',
          iconColor: 'white',
        };
      default:
        return {
          background: theme.colors.primary,
          icon: 'information',
          iconColor: 'white',
        };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 10,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleDismiss}
        style={[
          styles.notification,
          {
            backgroundColor: theme.isDark ? theme.colors.card : 'white',
            shadowColor: colorScheme.background,
          },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme.background },
          ]}
        >
          <Icon
            name={notification.icon || colorScheme.icon}
            size={24}
            color={colorScheme.iconColor}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            style={[styles.message, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
        </View>

        {/* Action or Close */}
        {notification.action ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colorScheme.background }]}
            onPress={handleAction}
          >
            <Text style={styles.actionText}>{notification.action.label}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colorScheme.background,
            opacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: colorScheme.background,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

// Notification Manager Hook
export const useInAppNotification = () => {
  const [notification, setNotification] = useState<InAppNotification | null>(null);
  const [queue, setQueue] = useState<InAppNotification[]>([]);

  const show = (newNotification: InAppNotification) => {
    if (notification) {
      // Add to queue if there's already a notification showing
      setQueue((prev) => [...prev, newNotification]);
    } else {
      setNotification(newNotification);
    }
  };

  const dismiss = () => {
    setNotification(null);
    
    // Show next in queue
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      setTimeout(() => {
        setNotification(next);
      }, 300);
    }
  };

  const showSuccess = (title: string, message: string, action?: InAppNotification['action']) => {
    show({
      id: Date.now().toString(),
      title,
      message,
      type: 'success',
      action,
    });
  };

  const showError = (title: string, message: string) => {
    show({
      id: Date.now().toString(),
      title,
      message,
      type: 'error',
      duration: 5000,
    });
  };

  const showAchievement = (title: string, message: string) => {
    show({
      id: Date.now().toString(),
      title,
      message,
      type: 'achievement',
      icon: 'trophy',
      duration: 6000,
    });
  };

  return {
    notification,
    show,
    dismiss,
    showSuccess,
    showError,
    showAchievement,
  };
};

// Global notification container that should be added to the root of your app
export const InAppNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notification, dismiss } = useInAppNotification();

  return (
    <>
      {children}
      <InAppNotificationComponent notification={notification} onDismiss={dismiss} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 999,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  progressBar: {
    height: 3,
    width: '100%',
    marginTop: 8,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
  },
});

export default InAppNotificationComponent;