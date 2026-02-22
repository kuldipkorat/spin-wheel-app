import 'react-native-reanimated';
import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/context/GameContext';
import { initializeAds } from './src/services/ads';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import SpinWheelScreen from './src/screens/SpinWheelScreen';
import ScratchCardScreen from './src/screens/ScratchCardScreen';
import WithdrawalScreen from './src/screens/WithdrawalScreen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoaded } = useGame();

  const onSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D1B2A' },
        headerTintColor: '#FFD700',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0D1B2A' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Spin & Win', headerShown: false }}
      />
      <Stack.Screen
        name="SpinWheel"
        component={SpinWheelScreen}
        options={{ title: 'Spin Wheel', headerShown: false }}
      />
      <Stack.Screen
        name="ScratchCard"
        component={ScratchCardScreen}
        options={{ title: 'Scratch Card', headerShown: false }}
      />
      <Stack.Screen
        name="Withdrawal"
        component={WithdrawalScreen}
        options={{ title: 'Withdrawal', headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  React.useEffect(() => {
    initializeAds();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GameProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </GameProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
