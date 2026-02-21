import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Custom popup for "Get Spins" on Home.
 * States: 'idle' | 'have_spins' | 'watch_ad' | 'loading' | 'success' | 'error'
 */
export default function GetSpinsModal({
  visible,
  spinCount,
  status,
  onWatchAd,
  onClose,
}) {
  const hasSpins = spinCount > 0;
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isLoading = status === 'loading';

  const getTitle = () => {
    if (status === 'have_spins') return 'You have spins!';
    if (status === 'success') return 'Spins added!';
    if (status === 'error') return 'Ad unavailable';
    return 'Get free spins';
  };

  const getMessage = () => {
    if (status === 'have_spins')
      return `You have ${spinCount} spin(s) available.\nUse them first!`;
    if (status === 'success') return 'You earned 5 free spins.';
    if (status === 'error') return 'Please try again later to earn spins.';
    return 'Watch a short video to earn 5 free spins.';
  };

  const showWatchAdButton =
    (status === 'idle' || status === 'watch_ad') && !hasSpins && !isLoading;

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
            <Text style={styles.emoji}>
              {hasSpins ? '🎡' : isSuccess ? '🎉' : isError ? '😕' : '📺'}
            </Text>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.message}>{getMessage()}</Text>
          </View>

          <View style={styles.buttons}>
            {isLoading && (
              <ActivityIndicator size="large" color={COLORS.gold} style={styles.loader} />
            )}
            {showWatchAdButton && (
              <>
                <TouchableOpacity
                  style={styles.adButton}
                  onPress={onWatchAd}
                  activeOpacity={0.85}
                >
                  <View style={styles.adLogoBox}>
                    <Text style={styles.adPlayIcon}>▶</Text>
                    <Text style={styles.adLogoText}>AD</Text>
                  </View>
                  <Text style={styles.adButtonText}>Watch Ad & Get 5 Spins</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.8}>
                  <Text style={styles.cancelButtonText}>Maybe later</Text>
                </TouchableOpacity>
              </>
            )}
            {(hasSpins || isSuccess || isError) && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>OK</Text>
              </TouchableOpacity>
            )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    width: '100%',
    gap: 12,
    minHeight: 52,
  },
  loader: {
    marginVertical: 8,
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
    paddingVertical: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
