import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { showRewardedAd } from '../services/ads';
import GetSpinsModal from '../components/GetSpinsModal';
import { COLORS } from '../constants/theme';

const REFERRAL_LINK = 'https://spinandwin.app/ref?code=SHARE123';
const { width } = Dimensions.get('window');
const BUTTON_GAP = 16;
const PADDING_H = 20;
const buttonSize = (width - PADDING_H * 2 - BUTTON_GAP) / 2 - BUTTON_GAP / 2;

export default function HomeScreen({ navigation }) {
  const { coinCount, spinCount, addSpins } = useGame();
  const [getSpinsVisible, setGetSpinsVisible] = useState(false);
  const [getSpinsStatus, setGetSpinsStatus] = useState('idle'); // idle | have_spins | watch_ad | loading | success | error

  const handleGetSpins = useCallback(() => {
    if (spinCount > 0) {
      setGetSpinsStatus('have_spins');
      setGetSpinsVisible(true);
      return;
    }
    setGetSpinsStatus('watch_ad');
    setGetSpinsVisible(true);
  }, [spinCount]);

  const handleWatchAdForSpins = useCallback(async () => {
    setGetSpinsStatus('loading');
    const granted = await showRewardedAd(() => addSpins(5));
    if (granted) {
      setGetSpinsStatus('success');
    } else {
      setGetSpinsStatus('error');
    }
  }, [addSpins]);

  const handleCloseGetSpins = useCallback(() => {
    setGetSpinsVisible(false);
    setGetSpinsStatus('idle');
  }, []);

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
    { id: 'spin', title: 'Spin Wheel', emoji: '🎡', onPress: () => navigation.navigate('SpinWheel'), color: COLORS.gold },
    { id: 'withdraw', title: 'Withdrawal', emoji: '💳', onPress: () => navigation.navigate('Withdrawal'), color: COLORS.primary },
    { id: 'spins', title: 'Get Spins', emoji: '📺', onPress: handleGetSpins, color: '#9C27B0' },
    { id: 'scratch', title: 'Scratch Card', emoji: '🎫', onPress: () => navigation.navigate('ScratchCard'), color: COLORS.goldDark },
    { id: 'share', title: 'Share', emoji: '📤', onPress: handleShare, color: COLORS.success },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Spin & Win</Text>
        <Text style={styles.headerSubtitle}>Win coins, get rewards</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🪙</Text>
          <View style={styles.statTextWrap}>
            <Text style={styles.statLabel}>Total Coins</Text>
            <Text style={styles.statValue}>{coinCount.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🎡</Text>
          <View style={styles.statTextWrap}>
            <Text style={styles.statLabel}>Spins</Text>
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

      <GetSpinsModal
        visible={getSpinsVisible}
        spinCount={spinCount}
        status={getSpinsStatus}
        onWatchAd={handleWatchAdForSpins}
        onClose={handleCloseGetSpins}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: PADDING_H,
    paddingBottom: 24,
  },
  headerBar: {
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.gold,
    gap: 12,
  },
  statEmoji: {
    fontSize: 32,
  },
  statTextWrap: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: BUTTON_GAP,
  },
  button: {
    width: buttonSize,
    minHeight: 100,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
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
