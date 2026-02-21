import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { showRewardedAd } from '../services/ads';
import RewardModal from '../components/RewardModal';
import { COLORS } from '../constants/theme';

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 48, 320);
const CARD_HEIGHT = 180;
const COLS = 16;
const ROWS = 9;
const REVEAL_THRESHOLD = 0.7;
const CELL_W = CARD_WIDTH / COLS;
const CELL_H = CARD_HEIGHT / ROWS;

const PRIZES = [10, 25, 50, 100, 250];
const SCRATCH_COLOR = '#8B7355';

function getCellsInRadius(cx, cy, r, cols, rows, cellW, cellH) {
  const cells = [];
  const minCol = Math.max(0, Math.floor((cx - r) / cellW));
  const maxCol = Math.min(cols - 1, Math.floor((cx + r) / cellW));
  const minRow = Math.max(0, Math.floor((cy - r) / cellH));
  const maxRow = Math.min(rows - 1, Math.floor((cy + r) / cellH));
  for (let col = minCol; col <= maxCol; col++) {
    for (let row = minRow; row <= maxRow; row++) {
      const cellCenterX = col * cellW + cellW / 2;
      const cellCenterY = row * cellH + cellH / 2;
      const dist = Math.hypot(cx - cellCenterX, cy - cellCenterY);
      if (dist <= r) cells.push({ col, row });
    }
  }
  return cells;
}

export default function ScratchCardScreen({ navigation }) {
  const { addCoins, addSpins } = useGame();
  const [scratched, setScratched] = useState(false);
  const [prize, setPrize] = useState(0);
  const [scratchedCells, setScratchedCells] = useState(new Set());
  const [showResultModal, setShowResultModal] = useState(false);
  const hasRevealed = useRef(false);

  const getRandomPrize = () =>
    PRIZES[Math.floor(Math.random() * PRIZES.length)];

  const resetCard = useCallback(() => {
    setScratched(false);
    setPrize(getRandomPrize());
    setScratchedCells(new Set());
    hasRevealed.current = false;
    setShowResultModal(false);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setShowResultModal(false);
    setScratched(false);
    setPrize(getRandomPrize());
    setScratchedCells(new Set());
    hasRevealed.current = false;
  }, []);

  const handleWatchAd = useCallback(async () => {
    const granted = await showRewardedAd(() => addSpins(5));
    if (granted) setShowResultModal(false);
  }, [addSpins]);

  useEffect(() => {
    setPrize(getRandomPrize());
  }, []);

  const totalCells = COLS * ROWS;
  const checkReveal = useCallback(
    (newScratched) => {
      if (hasRevealed.current) return;
      const ratio = newScratched.size / totalCells;
      if (ratio >= REVEAL_THRESHOLD) {
        hasRevealed.current = true;
        setScratched(true);
        addCoins(prize);
        setShowResultModal(true);
      }
    },
    [prize, addCoins]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        scratchAt(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        scratchAt(locationX, locationY);
      },
    })
  ).current;

  const scratchAt = (x, y) => {
    const cells = getCellsInRadius(x, y, CELL_W * 1.5, COLS, ROWS, CELL_W, CELL_H);
    const key = (c) => `${c.col},${c.row}`;
    setScratchedCells((prev) => {
      const next = new Set(prev);
      cells.forEach((c) => next.add(key(c)));
      checkReveal(next);
      return next;
    });
  };

  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const k = `${col},${row}`;
      grid.push({
        key: k,
        col,
        row,
        scratched: scratchedCells.has(k),
      });
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>Scratch & Win</Text>
      <Text style={styles.subtitle}>Scratch 70% to reveal your prize!</Text>

      <View style={styles.cardContainer}>
        <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
          <View style={styles.prizeLayer}>
            <Text style={styles.prizeEmoji}>🪙</Text>
            <Text style={styles.prizeText}>{prize} Coins</Text>
          </View>

          {!scratched && (
            <View
              style={[styles.scratchLayer, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
              {...panResponder.panHandlers}
            >
              {grid.map(({ key, col, row, scratched: s }) => (
                <View
                  key={key}
                  style={[
                    styles.cell,
                    {
                      width: CELL_W + 1,
                      height: CELL_H + 1,
                      left: col * CELL_W,
                      top: row * CELL_H,
                      backgroundColor: s ? 'transparent' : SCRATCH_COLOR,
                    },
                  ]}
                />
              ))}
              <View style={styles.scratchHintOverlay} pointerEvents="none">
                <Text style={styles.scratchHint}>Scratch here!</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <RewardModal
        visible={showResultModal}
        coinsWon={prize}
        playAgainLabel="Scratch Again"
        onPlayAgain={handlePlayAgain}
        onWatchAd={handleWatchAd}
        onClose={() => setShowResultModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.gold,
    position: 'relative',
  },
  prizeLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  scratchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    position: 'absolute',
  },
  scratchHintOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchHint: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  playAgainButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  playAgainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
