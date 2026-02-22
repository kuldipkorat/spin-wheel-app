import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Resilient AdMob Service
 * Prevents "TurboModuleRegistry" crashes in Expo Go.
 */

let mobileAds, RewardedAd, RewardedAdEventType, InterstitialAd, AdEventType, TestIds, BannerAd, BannerAdSize;
let isSDKAvailable = false;

try {
  // Try to import the library
  const MobileAdsLib = require('react-native-google-mobile-ads');
  mobileAds = MobileAdsLib.default;
  ({ RewardedAd, RewardedAdEventType, InterstitialAd, AdEventType, TestIds, BannerAd, BannerAdSize } = MobileAdsLib);

  // Check if we can actually call initialize (proves native module is linked)
  if (mobileAds && typeof mobileAds === 'function' && BannerAd) {
    isSDKAvailable = true;
    console.log('[Ads] Native AdMob SDK detected and linked.');
  } else {
    console.log('[Ads] AdMob library imported but native components (BannerAd) missing.');
  }
} catch (e) {
  console.log('[Ads] Native AdMob SDK not found or error during import:', e.message);
  isSDKAvailable = false;
}

// In some APK builds, __DEV__ might be false but we still want test ads
// You can change this to true if you want to FORCE Google Test IDs in your APK
const FORCE_TEST_ADS = false;

const REWARDED_AD_UNIT_ID = (__DEV__ || FORCE_TEST_ADS)
  ? 'ca-app-pub-3940256099942544/5224354917' // Google Test ID
  : 'ca-app-pub-6310355604963532/6489161656'; // Your Production ID

const BANNER_AD_UNIT_ID = (__DEV__ || FORCE_TEST_ADS)
  ? 'ca-app-pub-3940256099942544/6300978111' // Google Test ID
  : 'ca-app-pub-3940256099942544/6300978111'; // Using provided test ID for now

let rewardedAd = null;
let isRewardedAdLoading = false;

export const initializeAds = async () => {
  if (!isSDKAvailable) {
    console.log('[Ads] SDK initialization skipped: Using Mock Mode.');
    return;
  }

  try {
    await mobileAds().initialize();
    console.log('[Ads] SDK Initialized Successfully.');
    preloadRewardedAd();
  } catch (error) {
    console.warn('[Ads] SDK Initialization failed:', error);
    isSDKAvailable = false; // Fallback to mock
  }
};

/**
 * Banner Ad View Component
 * Renders real BannerAd if available, else a Mock Banner.
 */
export const BannerAdView = () => {
  if (isSDKAvailable) {
    return (
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={(error) => console.warn('[Ads] Banner failed:', error)}
        />
      </View>
    );
  }

  // Mock Banner for Expo Go / Dev
  return (
    <View style={styles.mockBanner}>
      <Text style={styles.mockBannerText}>[ TEST BANNER AD ]</Text>
      <Text style={styles.mockBannerSub}>{BANNER_AD_UNIT_ID}</Text>
    </View>
  );
};

export const preloadRewardedAd = () => {
  if (!isSDKAvailable || rewardedAd || isRewardedAdLoading) {
    return;
  }

  try {
    isRewardedAdLoading = true;
    const ad = RewardedAd.createForAdRequest(__DEV__ ? TestIds.REWARDED : REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedAd = ad;
      isRewardedAdLoading = false;
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      isRewardedAdLoading = false;
      rewardedAd = null;
      setTimeout(preloadRewardedAd, 15000);
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      rewardedAd = null;
      preloadRewardedAd();
    });

    ad.load();
  } catch (e) {
    isSDKAvailable = false;
  }
};

export const showRewardedAd = (onRewarded) => {
  return new Promise((resolve) => {
    if (!isSDKAvailable) {
      console.log(`[Ads] Showing Mock Reward Ad...`);
      setTimeout(() => {
        onRewarded?.();
        resolve(true);
      }, 2000);
      return;
    }

    if (!rewardedAd) {
      preloadRewardedAd();
      resolve(false);
      return;
    }

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => onRewarded?.()
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeEarned();
      unsubscribeClosed();
      resolve(true);
    });

    rewardedAd.show();
  });
};

export const showInterstitialAd = () => {
  return new Promise((resolve) => {
    if (!isSDKAvailable) {
      setTimeout(() => resolve(true), 1000);
      return;
    }
    resolve(true);
  });
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockBanner: {
    width: '100%',
    height: 60,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  mockBannerText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mockBannerSub: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
});
