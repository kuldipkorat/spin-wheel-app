import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const spinRotation = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 200 })
    );
    spinRotation.value = withTiming(360 * 2, {
      duration: 2500,
    });

    // Progress bar animation (0% to 100% over 2.5s)
    progress.value = withTiming(1, { duration: 2500 });

    const timer = setTimeout(() => {
      onFinish?.();
    }, 2800); // Slightly after bar fills for premium feel

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${spinRotation.value}deg` },
    ],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.wheelPlaceholder}>
            <Text style={styles.wheelEmoji}>🎡</Text>
          </View>
        </Animated.View>
        <Text style={styles.title}>SPIN & WIN</Text>
        <Text style={styles.subtitle}>Win Coins • Win Prizes</Text>
      </View>

      <View style={styles.loaderContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        <Text style={styles.loadingText}>Loading Premium Experience...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  content: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoContainer: {
    marginBottom: 24,
  },
  wheelPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  wheelEmoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 6,
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  loaderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
