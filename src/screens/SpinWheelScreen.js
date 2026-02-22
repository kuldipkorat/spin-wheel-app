import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { showRewardedAd, BannerAdView } from '../services/ads';
import RewardModal from '../components/RewardModal';
import OutOfCreditsModal from '../components/OutOfCreditsModal';
import AnimatedNumber from '../components/AnimatedNumber';
import CelebratoryPop from '../components/CelebratoryPop';
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
  const { spinCount, useSpin, addCoins, addSpins } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastWonCoins, setLastWonCoins] = useState(0);
  const rotation = useSharedValue(0);

  const openResultModal = useCallback((coins) => {
    setLastWonCoins(coins);
    if (amount > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowResultModal(true), 1500);
    } else {
      setShowResultModal(true);
    }
  }, []);

  const spin = useCallback(() => {
    if (spinning || spinCount <= 0) {
      if (spinCount <= 0) {
        setShowRefillModal(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          runOnJS(openResultModal)(segment.value);
          if (segment.value > 0) {
            runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
          }
        }
      }
    );
  }, [spinCount, spinning, useSpin, addCoins, openResultModal]);

  const handleWatchAd = useCallback(async () => {
    const granted = await showRewardedAd(() => addSpins(5));
    if (granted) {
      setShowResultModal(false);
      setShowRefillModal(false);
    }
  }, [addSpins]);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const { width } = Dimensions.get('window');
  const size = Math.min(width - 64, 320);
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonTop} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonTextTop}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>COINS</Text>
              <AnimatedNumber value={coinCount} style={styles.statValue} />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SPINS</Text>
              <Text style={styles.statValue}>{spinCount}</Text>
            </View>
          </View>
        </View>

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

        <View style={styles.bannerWrapper}>
          <BannerAdView />
        </View>
      </SafeAreaView>

      <RewardModal
        visible={showResultModal}
        coinsWon={lastWonCoins}
        playAgainLabel="Spin Again"
        onPlayAgain={() => setShowResultModal(false)}
        onWatchAd={handleWatchAd}
        onClose={() => setShowResultModal(false)}
      />

      <OutOfCreditsModal
        visible={showRefillModal}
        type="spins"
        onWatchAd={handleWatchAd}
        onClose={() => setShowRefillModal(false)}
      />

      <CelebratoryPop
        visible={showCelebration}
        onFinish={() => setShowCelebration(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 12, // Reduced padding because SafeArea handles the notch
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: 'bold',
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
    minHeight: 52,
    justifyContent: 'center',
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  bannerWrapper: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 10,
  },
});
