import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  G,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
} from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 200;
const PADDING = 20;

interface DataPoint {
  label: string;
  value: number;
  date?: Date;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  showDots?: boolean;
  animated?: boolean;
  gradientColors?: string[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = CHART_HEIGHT,
  showDots = true,
  animated = true,
  gradientColors = ['#6366F1', '#8B5CF6'],
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const chartWidth = CHART_WIDTH - PADDING * 2;
  const chartHeight = height - PADDING * 2;

  const points = data.map((point, index) => ({
    x: (index / (data.length - 1)) * chartWidth + PADDING,
    y:
      chartHeight -
      ((point.value - minValue) / valueRange) * chartHeight +
      PADDING,
  }));

  const pathData = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    
    const prev = points[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = prev.x + (2 * (point.x - prev.x)) / 3;
    const cp2y = point.y;
    
    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${pathData} L ${points[points.length - 1].x} ${
    chartHeight + PADDING
  } L ${PADDING} ${chartHeight + PADDING} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={CHART_WIDTH} height={height}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={gradientColors[1]} stopOpacity="0.1" />
          </SvgLinearGradient>
        </Defs>

        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = PADDING + (i * chartHeight) / 4;
          return (
            <Line
              key={i}
              x1={PADDING}
              y1={y}
              x2={CHART_WIDTH - PADDING}
              y2={y}
              stroke={theme.isDark ? '#334155' : '#E5E7EB'}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Area */}
        <Path d={areaPath} fill="url(#gradient)" opacity="0.3" />

        {/* Line */}
        <Path
          d={pathData}
          fill="none"
          stroke={gradientColors[0]}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots &&
          points.map((point, index) => (
            <G key={index}>
              <Circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill={gradientColors[0]}
              />
              <Circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
              />
            </G>
          ))}

        {/* Labels */}
        {data.map((point, index) => (
          <SvgText
            key={index}
            x={points[index].x}
            y={chartHeight + PADDING + 15}
            fontSize="12"
            fill={theme.isDark ? '#94A3B8' : '#6B7280'}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  barColor?: string;
  animated?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = CHART_HEIGHT,
  barColor = '#6366F1',
  animated = true,
}) => {
  const { theme } = useTheme();
  const animatedValues = useRef(
    data.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (animated) {
      const animations = animatedValues.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 100,
          useNativeDriver: false,
        })
      );
      Animated.parallel(animations).start();
    }
  }, [data]);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartWidth = CHART_WIDTH - PADDING * 2;
  const chartHeight = height - PADDING * 3;
  const barWidth = chartWidth / data.length * 0.6;
  const barSpacing = chartWidth / data.length;

  return (
    <View style={styles.chartContainer}>
      <Svg width={CHART_WIDTH} height={height}>
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = PADDING + (i * chartHeight) / 4;
          const value = Math.round(((4 - i) * maxValue) / 4);
          
          return (
            <G key={i}>
              <Line
                x1={PADDING}
                y1={y}
                x2={CHART_WIDTH - PADDING}
                y2={y}
                stroke={theme.isDark ? '#334155' : '#E5E7EB'}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              <SvgText
                x={PADDING - 5}
                y={y + 4}
                fontSize="10"
                fill={theme.isDark ? '#94A3B8' : '#6B7280'}
                textAnchor="end"
              >
                {value}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const x = PADDING + index * barSpacing + (barSpacing - barWidth) / 2;
          const y = PADDING + chartHeight - barHeight;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                rx={4}
                opacity={0.8}
              />
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="12"
                fill={theme.isDark ? '#F3F4F6' : '#111827'}
                textAnchor="middle"
                fontWeight="bold"
              >
                {point.value}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                fontSize="11"
                fill={theme.isDark ? '#94A3B8' : '#6B7280'}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  maxValue = 100,
  size = 150,
  strokeWidth = 15,
  color = '#6366F1',
  label,
  showPercentage = true,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value / maxValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [value, maxValue]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const percentage = Math.round((value / maxValue) * 100);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.isDark ? '#334155' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularContent}>
        {showPercentage && (
          <Text
            style={[
              styles.percentageText,
              { color: theme.isDark ? '#F3F4F6' : '#111827' },
            ]}
          >
            {percentage}%
          </Text>
        )}
        {label && (
          <Text
            style={[
              styles.labelText,
              { color: theme.isDark ? '#94A3B8' : '#6B7280' },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  chartContainer: {
    marginVertical: 10,
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default { LineChart, BarChart, CircularProgress };