/**
 * AdMob placeholder service
 * Replace with react-native-google-mobile-ads implementation for production
 */

const IS_DEV = __DEV__;

export const initializeAds = async () => {
  if (IS_DEV) {
    console.log('[Ads] Initialization skipped in dev mode');
  }
  // TODO: Initialize Google Mobile Ads SDK
};

export const loadInterstitialAd = async () => {
  if (IS_DEV) {
    console.log('[Ads] Interstitial load placeholder');
  }
  // TODO: Load Interstitial for screen transitions
};

export const showInterstitialAd = async () => {
  if (IS_DEV) {
    console.log('[Ads] Interstitial show placeholder - would show ad');
    return true;
  }
  // TODO: Show Interstitial ad
  return true;
};

export const loadRewardedAd = async () => {
  if (IS_DEV) {
    console.log('[Ads] Rewarded load placeholder');
  }
  // TODO: Load Rewarded Video ad
};

export const showRewardedAd = async (onRewarded) => {
  if (IS_DEV) {
    console.log('[Ads] Rewarded show placeholder - granting +5 spins');
    onRewarded?.();
    return true;
  }
  // TODO: Show Rewarded ad, call onRewarded() when user earns reward
  return true;
};
