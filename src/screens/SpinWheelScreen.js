import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';
import { useGame } from '../context/GameContext';
import { COLORS } from '../constants/theme';

const SEGMENTS = [
  { label: '10', value: 10, color: '#4CAF50' },
  { label: 'Try Again', value: 0, color: '#E53935' },
  { label: '50', value: 50, color: '#2196F3' },
  { label: 'Try Again', value: 0, color: '#E53935' },
  { label: '100', value: 100, color: '#9C27B0' },
  { label: 'Try Again', value: 0, color: '#E53935' },
  { label: '500', value: 500, color: COLORS.gold },
  { label: 'Try Again', value: 0, color: '#E53935' },
  { label: '10', value: 10, color: '#4CAF50' },
  { label: '50', value: 50, color: '#2196F3' },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function SpinWheelScreen({ navigation }) {
  const { spinCount, useSpin, addCoins } = useGame();
  const [spinning, setSpinning] = useState(false);
  const rotation = useSharedValue(0);

  const spin = useCallback(() => {
    if (spinning || spinCount <= 0) {
      if (spinCount <= 0) {
        Alert.alert('No Spins', 'Watch an ad to get more spins!');
      }
      return;
    }

    setSpinning(true);
    useSpin();

    const randomIndex = Math.floor(Math.random() * SEGMENTS.length);
    const targetAngle = 360 * 5 + (360 - randomIndex * SEGMENT_ANGLE) - SEGMENT_ANGLE / 2;
    const segment = SEGMENTS[randomIndex];

    rotation.value = withTiming(
      rotation.value + targetAngle,
      { duration: 4000 },
      (finished) => {
        if (finished) {
          runOnJS(addCoins)(segment.value);
          runOnJS(setSpinning)(false);
          if (segment.value > 0) {
            runOnJS(Alert.alert)('Winner!', `You won ${segment.value} coins!`);
          } else {
            runOnJS(Alert.alert)('Try Again', 'Better luck next time!');
          }
        }
      }
    );
  }, [spinCount, spinning, useSpin, addCoins]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const { width } = Dimensions.get('window');
  const size = Math.min(width - 64, 320);
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spin the Wheel</Text>
      <Text style={styles.spinsLeft}>Spins: {spinCount}</Text>

      <View style={styles.wheelWrapper}>
        <View style={[styles.wheelContainer, { width: size, height: size }]}>
          <Animated.View style={[styles.wheel, wheelStyle]}>
            <Svg width={size} height={size}>
              <G x={0} y={0}>
                {SEGMENTS.map((seg, i) => {
                  const startAngle = i * SEGMENT_ANGLE;
                  const endAngle = startAngle + SEGMENT_ANGLE;
                  const d = describeArc(cx, cy, r, startAngle, endAngle);
                  return (
                    <Path
                      key={i}
                      d={d}
                      fill={seg.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                })}
              </G>
            </Svg>
            <View style={styles.labelsOverlay} pointerEvents="none">
              {SEGMENTS.map((seg, i) => {
                const angle = (i + 0.5) * SEGMENT_ANGLE - 90;
                const rad = (angle * Math.PI) / 180;
                const labelR = r * 0.65;
                const x = cx + labelR * Math.cos(rad);
                const y = cy + labelR * Math.sin(rad);
                return (
                  <View
                    key={i}
                    style={[
                      styles.labelBox,
                      {
                        left: x - 28,
                        top: y - 12,
                        transform: [{ rotate: `${(i + 0.5) * SEGMENT_ANGLE}deg` }],
                      },
                    ]}
                  >
                    <Text style={styles.segmentText} numberOfLines={1}>
                      {seg.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        </View>
        <View style={styles.pointer} />
      </View>

      <TouchableOpacity
        style={[styles.spinButton, spinCount <= 0 && styles.spinButtonDisabled]}
        onPress={spin}
        disabled={spinning || spinCount <= 0}
      >
        <Text style={styles.spinButtonText}>
          {spinning ? 'Spinning...' : spinCount > 0 ? 'SPIN' : 'Get More Spins'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 8,
  },
  spinsLeft: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  wheelWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  wheelContainer: {
    overflow: 'hidden',
    borderRadius: 999,
    borderWidth: 6,
    borderColor: COLORS.gold,
  },
  wheel: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  labelsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  labelBox: {
    position: 'absolute',
    width: 56,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointer: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -15,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.gold,
  },
  spinButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  spinButtonDisabled: {
    backgroundColor: COLORS.card,
    opacity: 0.7,
  },
  spinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
