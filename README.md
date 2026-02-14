# Spin & Win - Rewards App

A React Native (Expo) mobile application featuring a spin wheel, scratch cards, and withdrawal system.

## Features

- **Splash Screen**: 2-second animated entry with brand styling
- **Home Dashboard**: Persistent display of Total Coins and Available Spins
- **Spin Wheel**: Rotating wheel with segments (10, 50, 100, 500, Try Again)
- **Scratch Card**: Canvas-based scratch-off revealing coin prize at 70% clear
- **Withdrawal**: Balance display, payment method selection (PayPal, Bank Transfer, UPI)
- **Get Spins**: Rewarded video ad integration (placeholder - grant +5 spins)
- **Share**: Native share sheet with referral link

## Economy

- New users start with **2 free spins**
- $1 = 1000 coins
- Spin wheel prizes: 10, 50, 100, 500 coins or "Try Again"
- Scratch card prizes: 10, 25, 50, 100, 250 coins

## Tech Stack

- React Native (Expo ~51)
- React Navigation (Native Stack)
- React Native Reanimated (smooth wheel rotation)
- React Native SVG (wheel segments)
- AsyncStorage (persist coins & spins)
- Context API (global state)

## Setup

```bash
cd "G:\Project\spin wheel app"
npm install
npx expo start
```

Then scan the QR code with Expo Go (Android) or Camera (iOS).

## Ad Integration

The app includes placeholder functions in `src/services/ads.js` for:
- **Interstitial Ads**: Screen transitions (placeholder)
- **Rewarded Ads**: Get +5 spins when spins = 0 (placeholder - currently grants spins in dev)

Replace with `react-native-google-mobile-ads` for production.

## Project Structure

```
├── App.js                 # Entry, navigation, providers
├── src/
│   ├── context/
│   │   └── GameContext.js # Coins, spins, persistence
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SpinWheelScreen.js
│   │   ├── ScratchCardScreen.js
│   │   └── WithdrawalScreen.js
│   ├── services/
│   │   └── ads.js         # AdMob placeholder
│   └── constants/
│       └── theme.js       # Gold & royal blue palette
├── assets/                # Add icon.png, splash.png, adaptive-icon.png
└── package.json
```

## Assets

Add the following to `assets/` for full build:
- `icon.png` (1024×1024)
- `splash.png` (1284×2778)
- `adaptive-icon.png` (1024×1024)

Expo will run without them; defaults are used in development.
