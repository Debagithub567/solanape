import '../src/polyfills';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Warm up AsyncStorage before Zustand tries to use it
    AsyncStorage.getItem('solanape-wallet-storage')
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D12', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0D0D12" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="send"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="receive"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}