import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = '@spin_win_coins';
const SPINS_KEY = '@spin_win_spins';
const SCRATCHES_KEY = '@spin_win_scratches';
const INITIAL_SPINS = 10;
const INITIAL_SCRATCHES = 10;
const COINS_PER_DOLLAR = 1000;

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [coinCount, setCoinCount] = useState(0);
  const [spinCount, setSpinCount] = useState(INITIAL_SPINS);
  const [scratchCount, setScratchCount] = useState(INITIAL_SCRATCHES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveState();
    }
  }, [coinCount, spinCount, scratchCount, isLoaded]);

  const loadState = async () => {
    try {
      const [savedCoins, savedSpins, savedScratches] = await Promise.all([
        AsyncStorage.getItem(COINS_KEY),
        AsyncStorage.getItem(SPINS_KEY),
        AsyncStorage.getItem(SCRATCHES_KEY),
      ]);
      if (savedCoins !== null) setCoinCount(parseInt(savedCoins, 10));
      if (savedSpins !== null) setSpinCount(parseInt(savedSpins, 10));
      if (savedScratches !== null) setScratchCount(parseInt(savedScratches, 10));
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
    setIsLoaded(true);
  };

  const saveState = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(COINS_KEY, String(coinCount)),
        AsyncStorage.setItem(SPINS_KEY, String(spinCount)),
        AsyncStorage.setItem(SCRATCHES_KEY, String(scratchCount)),
      ]);
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  };

  const addCoins = useCallback((amount) => {
    setCoinCount((prev) => prev + amount);
  }, []);

  const useSpin = useCallback(() => {
    setSpinCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const addSpins = useCallback((amount) => {
    setSpinCount((prev) => prev + amount);
  }, []);

  const useScratch = useCallback(() => {
    setScratchCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const addScratches = useCallback((amount) => {
    setScratchCount((prev) => prev + amount);
  }, []);

  const coinsToCurrency = useCallback((coins) => {
    return (coins / COINS_PER_DOLLAR).toFixed(2);
  }, []);

  const currencyToCoins = useCallback((amount) => {
    return Math.floor(amount * COINS_PER_DOLLAR);
  }, []);

  const value = {
    coinCount,
    spinCount,
    scratchCount,
    isLoaded,
    addCoins,
    useSpin,
    addSpins,
    useScratch,
    addScratches,
    coinsToCurrency,
    currencyToCoins,
    COINS_PER_DOLLAR,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
