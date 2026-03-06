import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useWalletStore } from '../../../src/stores/wallet-store';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { shortenAddress } from '../../utils/solana';

const ALERTS = [
  { id: '1', emoji: '⚡', title: 'Transaction Confirmed', sub: 'Sent 0.5 SOL to Rahul Dev', time: '10m ago', color: Colors.green },
  { id: '2', emoji: '💰', title: 'Received SKR', sub: 'Got 100 SKR from Priya Singh', time: '45m ago', color: Colors.skrGold },
  { id: '3', emoji: '🔮', title: 'Seeker Network', sub: 'SKR token integration active', time: '2h ago', color: Colors.purple },
  { id: '4', emoji: '🚀', title: 'Devnet Active', sub: 'You\'re connected to Solana devnet', time: '3h ago', color: Colors.blue },
];

export default function ProfileScreen() {
  const { connected, publicKey, solBalance, skrBalance, disconnect, connect } = useWalletStore();

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.sub}>Activity & Notifications</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Wallet card */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.walletCard}>
            <View style={styles.walletCardTop}>
              <View>
                <Text style={styles.walletLabel}>My Wallet</Text>
                <Text style={styles.walletAddr}>{publicKey ? shortenAddress(publicKey, 8) : 'Not connected'}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: connected ? Colors.greenDim : 'rgba(255,77,109,0.1)', borderColor: connected ? Colors.greenBorder : 'rgba(255,77,109,0.25)' }]}>
                <View style={[styles.statusDot, { backgroundColor: connected ? Colors.green : Colors.error }]} />
                <Text style={[styles.statusText, { color: connected ? Colors.green : Colors.error }]}>
                  {connected ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
            {connected && (
              <View style={styles.balancesRow}>
                <View style={styles.balancePill}>
                  <Text style={styles.balancePillVal}>{solBalance} SOL</Text>
                </View>
                <View style={[styles.balancePill, { borderColor: Colors.skrGoldBorder, backgroundColor: Colors.skrGoldDim }]}>
                  <Text style={[styles.balancePillVal, { color: Colors.skrGold }]}>{skrBalance} SKR</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Alerts */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {ALERTS.map((alert, i) => (
            <Animated.View key={alert.id} entering={FadeInDown.delay(150 + i * 60).duration(280)}>
              <TouchableOpacity style={styles.alertRow} activeOpacity={0.8}>
                <View style={[styles.alertIcon, { backgroundColor: `${alert.color}15` }]}>
                  <Text style={{ fontSize: 20 }}>{alert.emoji}</Text>
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertSub}>{alert.sub}</Text>
                </View>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.screen },
  header: { paddingHorizontal: Spacing.screen, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  walletCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: 18, marginBottom: 24,
  },
  walletCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  walletLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  walletAddr: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'monospace', marginTop: 3 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  balancesRow: { flexDirection: 'row', gap: 8 },
  balancePill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.greenDim, borderWidth: 1, borderColor: Colors.greenBorder,
  },
  balancePillVal: { fontSize: 13, fontWeight: '700', color: Colors.green },

  sectionTitle: { fontSize: 13, color: Colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  alertIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  alertSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  alertTime: { fontSize: 11, color: Colors.textMuted },
});