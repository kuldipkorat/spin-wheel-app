import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 400 }),
      withTiming(1, { duration: 200 })
    );
    spinRotation.value = withTiming(360 * 2, {
      duration: 2000,
    });

    const timer = setTimeout(() => {
      onFinish?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${spinRotation.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.wheelPlaceholder}>
          <Text style={styles.wheelEmoji}>🎡</Text>
        </View>
      </Animated.View>
      <Animated.Text style={[styles.title, textStyle]}>SPIN & WIN</Animated.Text>
      <Animated.Text style={[styles.subtitle, textStyle]}>
        Win Coins • Win Prizes
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  wheelPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  wheelEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
});
