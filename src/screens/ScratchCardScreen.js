import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Canvas,
  Path,
  Skia,
  TouchInfo,
  useTouchHandler,
  Mask,
  Rect,
  Image,
  useImage,
  Group
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { showRewardedAd, BannerAdView } from '../services/ads';
import RewardModal from '../components/RewardModal';
import OutOfCreditsModal from '../components/OutOfCreditsModal';
import AnimatedNumber from '../components/AnimatedNumber';
import CelebratoryPop from '../components/CelebratoryPop';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 40, 340);
const CARD_HEIGHT = 200;
const REVEAL_THRESHOLD = 0.5; // 50% as requested

const PRIZES = [10, 25, 50, 100, 250, 500];

export default function ScratchCardScreen({ navigation }) {
  const { coinCount, scratchCount, useScratch, addCoins, addScratches } = useGame();
  const [prize, setPrize] = useState(10);
  const [scratched, setScratched] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Skia State
  const [paths, setPaths] = useState([]);

  // Tracking revealed area via a simple grid for performance
  const gridWidth = 20;
  const gridHeight = 12;
  const [revealedGrid, setRevealedGrid] = useState(new Array(gridWidth * gridHeight).fill(false));

  const getRandomPrize = () => PRIZES[Math.floor(Math.random() * PRIZES.length)];

  useEffect(() => {
    setPrize(getRandomPrize());
  }, []);

  const resetCard = useCallback(() => {
    setPrize(getRandomPrize());
    setScratched(false);
    setPaths([]);
    setRevealedGrid(new Array(gridWidth * gridHeight).fill(false));
    setShowResultModal(false);
  }, []);

  const handleReveal = useCallback(() => {
    if (scratched) return;
    setScratched(true);
    addCoins(prize);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);
    // Modal will show after celebration finishes or after a delay
    setTimeout(() => setShowResultModal(true), 1500);
  }, [scratched, prize, addCoins]);

  const updateGrid = (x, y) => {
    const col = Math.floor((x / CARD_WIDTH) * gridWidth);
    const row = Math.floor((y / CARD_HEIGHT) * gridHeight);

    if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
      const index = row * gridWidth + col;
      if (!revealedGrid[index]) {
        const newGrid = [...revealedGrid];
        // Scratch a small 3x3 area in the grid for better feel
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const nc = col + i;
            const nr = row + j;
            if (nc >= 0 && nc < gridWidth && nr >= 0 && nr < gridHeight) {
              newGrid[nr * gridWidth + nc] = true;
            }
          }
        }
        setRevealedGrid(newGrid);

        // Check if 50% revealed
        const revealedCount = newGrid.filter(v => v).length;
        if (revealedCount / (gridWidth * gridHeight) >= REVEAL_THRESHOLD) {
          handleReveal();
        }
      }
    }
  };

  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      if (scratched || scratchCount <= 0) {
        if (scratchCount <= 0 && !scratched) setShowRefillModal(true);
        return;
      }
      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      setPaths(prev => [...prev, newPath]);
      updateGrid(x, y);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onActive: ({ x, y }) => {
      if (scratched || scratchCount <= 0) return;
      const lastPath = paths[paths.length - 1];
      if (lastPath) {
        lastPath.lineTo(x, y);
        setPaths([...paths]); // Trigger re-render
        updateGrid(x, y);
      }
    },
    onEnd: () => {
      if (!scratched && paths.length === 1 && scratchCount > 0) {
        useScratch();
      }
    }
  }, [paths, scratched, scratchCount]);

  const handleWatchAd = async () => {
    const granted = await showRewardedAd(() => addScratches(5));
    if (granted) setShowRefillModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>COINS</Text>
            <AnimatedNumber value={coinCount} style={styles.statValue} />
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SCRATCHES</Text>
            <Text style={styles.statValue}>{scratchCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.title}>Scratch & Win</Text>
        <Text style={styles.subtitle}>Reveal 50% to claim your prize!</Text>

        <View style={styles.cardWrapper}>
          <View style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            {/* Prize Layer (Background) */}
            <View style={styles.prizeLayer}>
              <Text style={styles.prizeEmoji}>🪙</Text>
              <Text style={styles.prizeAmount}>{prize} Coins</Text>
              {scratched && <Text style={styles.winText}>WINNER!</Text>}
            </View>

            {/* Skia Scratch Layer */}
            {!scratched && (
              <Canvas style={styles.canvas} onTouch={touchHandler}>
                <Mask
                  mask={
                    <Group>
                      <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="white" />
                      {paths.map((path, index) => (
                        <Path
                          key={index}
                          path={path}
                          strokeWidth={40}
                          style="stroke"
                          strokeJoin="round"
                          strokeCap="round"
                          color="black"
                        />
                      ))}
                    </Group>
                  }
                >
                  <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#C0C0C0" />
                  <Group>
                    <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#8B7355" />
                    {/* Textures or patterns could be added here */}
                  </Group>
                </Mask>
              </Canvas>
            )}

            {!scratched && paths.length === 0 && (
              <View style={styles.hintOverlay} pointerEvents="none">
                <Text style={styles.hintText}>SCRATCH HERE</Text>
              </View>
            )}
          </View>
        </View>

        {scratched && (
          <TouchableOpacity style={styles.playAgainBtn} onPress={resetCard}>
            <Text style={styles.playAgainText}>Next Card</Text>
          </TouchableOpacity>
        )}
      </View>

      <RewardModal
        visible={showResultModal}
        coinsWon={prize}
        playAgainLabel="Scratch Again"
        onPlayAgain={resetCard}
        onWatchAd={handleWatchAd}
        onClose={() => setShowResultModal(false)}
      />

      <OutOfCreditsModal
        visible={showRefillModal}
        type="scratches"
        onWatchAd={handleWatchAd}
        onClose={() => setShowRefillModal(false)}
      />

      <CelebratoryPop
        visible={showCelebration}
        onFinish={() => setShowCelebration(false)}
      />

      <View style={styles.bannerContainer}>
        <BannerAdView />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    minWidth: 80,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  cardWrapper: {
    padding: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  prizeLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  prizeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  winText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
    letterSpacing: 2,
  },
  canvas: {
    flex: 1,
  },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  playAgainBtn: {
    marginTop: 40,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
  },
  playAgainText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 10,
  },
});
