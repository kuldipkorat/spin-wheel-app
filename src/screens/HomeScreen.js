import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { showRewardedAd } from '../services/ads';
import { COLORS } from '../constants/theme';

const REFERRAL_LINK = 'https://spinandwin.app/ref?code=SHARE123';

export default function HomeScreen({ navigation }) {
  const { coinCount, spinCount, addSpins } = useGame();

  const handleGetSpins = async () => {
    if (spinCount > 0) {
      Alert.alert('You have spins!', `You have ${spinCount} spin(s) available. Use them first!`);
      return;
    }
    const granted = await showRewardedAd(() => addSpins(5));
    if (granted) {
      Alert.alert('Success!', 'You earned 5 free spins!');
    } else {
      Alert.alert('Ad Unavailable', 'Please try again later to earn spins.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Spin & Win! Use my referral link to get bonus coins: ${REFERRAL_LINK}`,
        title: 'Spin & Win - Referral',
        url: REFERRAL_LINK,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const buttons = [
    {
      id: 'spin',
      title: 'Spin Wheel',
      emoji: '🎡',
      onPress: () => navigation.navigate('SpinWheel'),
      color: COLORS.gold,
    },
    {
      id: 'withdraw',
      title: 'Withdrawal',
      emoji: '💳',
      onPress: () => navigation.navigate('Withdrawal'),
      color: COLORS.primary,
    },
    {
      id: 'spins',
      title: 'Get Spins',
      emoji: '📺',
      onPress: handleGetSpins,
      color: '#9C27B0',
    },
    {
      id: 'scratch',
      title: 'Scratch Card',
      emoji: '🎫',
      onPress: () => navigation.navigate('ScratchCard'),
      color: COLORS.goldDark,
    },
    {
      id: 'share',
      title: 'Share',
      emoji: '📤',
      onPress: handleShare,
      color: COLORS.success,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🪙</Text>
          <View>
            <Text style={styles.statLabel}>Total Coins</Text>
            <Text style={styles.statValue}>{coinCount.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🎡</Text>
          <View>
            <Text style={styles.statLabel}>Available Spins</Text>
            <Text style={styles.statValue}>{spinCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn.id}
            style={[styles.button, { borderColor: btn.color }]}
            onPress={btn.onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonEmoji}>{btn.emoji}</Text>
            <Text style={styles.buttonText}>{btn.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const buttonSize = (width - 48) / 2 - 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    gap: 12,
  },
  statEmoji: {
    fontSize: 32,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});
