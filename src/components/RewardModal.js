import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Reusable reward popup after spin or scratch.
 * @param {boolean} visible
 * @param {number} coinsWon - coins earned
 * @param {string} playAgainLabel - "Spin Again" or "Scratch Again"
 * @param {function} onPlayAgain
 * @param {function} onWatchAd - rewarded ad, then callback to add spins/cards
 * @param {function} onClose - optional, e.g. when tapping outside
 */
export default function RewardModal({
  visible,
  coinsWon,
  playAgainLabel,
  onPlayAgain,
  onWatchAd,
  onClose,
}) {
  const isWin = coinsWon > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.emoji}>{isWin ? '🎉' : '😅'}</Text>
            <Text style={styles.title}>
              {isWin ? 'You won!' : 'Try again'}
            </Text>
            <View style={styles.coinRow}>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.coinValue}>{coinsWon} Coins</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onPlayAgain}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{playAgainLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adButton}
              onPress={onWatchAd}
              activeOpacity={0.85}
            >
              <View style={styles.adLogoBox}>
                <Text style={styles.adPlayIcon}>▶</Text>
                <Text style={styles.adLogoText}>AD</Text>
              </View>
              <Text style={styles.adButtonText}>Watch Ad & Get More</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.gold,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 12,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    gap: 8,
  },
  coinEmoji: {
    fontSize: 28,
  },
  coinValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldDark,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    gap: 10,
  },
  adLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  adPlayIcon: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  adLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  adButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
