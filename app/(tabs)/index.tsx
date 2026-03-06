import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, StatusBar, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, interpolate, Extrapolation,
  FadeIn, FadeInDown, SlideInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useWalletStore } from '../../../src/stores/wallet-store';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { shortenAddress, formatBalance, formatUSD, generateMockWallet, getSOLBalance } from '../../utils/solana';
import { timeAgo } from '../../utils/solana';

const { width: SW } = Dimensions.get('window');

// ── Icons ──────────────────────────────────────────────
const SendIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke={Colors.green} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={Colors.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ReceiveIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M12 3V15M12 15L8 11M12 15L16 11" stroke={Colors.purple} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 20H19" stroke={Colors.purple} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const ScanIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" stroke={Colors.blue} strokeWidth="2.2" strokeLinecap="round" />
    <Rect x="7" y="7" width="10" height="10" rx="1" stroke={Colors.blue} strokeWidth="2" />
  </Svg>
);

const HistoryIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={Colors.skrGold} strokeWidth="2" />
    <Path d="M12 7V12L15 15" stroke={Colors.skrGold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ── Animated Balance Card ──────────────────────────────
function BalanceHero() {
  const { connected, publicKey, solBalance, skrBalance, solPriceUSD, connect, disconnect } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  const pulse = useSharedValue(1);
  const shimmer = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 14 });
    cardOpacity.value = withTiming(1, { duration: 500 });
    shimmer.value = withRepeat(withTiming(1, { duration: 2200 }), -1, false);
    if (connected) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1, true
      );
    }
  }, [connected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-SW, SW], Extrapolation.CLAMP) }],
  }));

  const handleConnect = () => {
    const wallet = generateMockWallet();
    connect(wallet.publicKey);
  };

  const totalUSD = (solBalance * solPriceUSD).toFixed(2);

  return (
    <Animated.View style={[styles.heroCard, cardStyle]}>
      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmer, shimmerStyle]} />

      {/* Background mesh */}
      <View style={styles.heroMesh}>
        <View style={[styles.meshBlob, { backgroundColor: Colors.green, top: -30, right: -20 }]} />
        <View style={[styles.meshBlob, { backgroundColor: Colors.purple, bottom: -20, left: -10 }]} />
      </View>

      {/* Top row */}
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroLabel}>
            {connected ? 'Total Portfolio' : 'Solanape Wallet'}
          </Text>
          {connected && (
            <Text style={styles.heroAddress}>{shortenAddress(publicKey!, 6)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.connectBtn, connected && styles.connectBtnActive]}
          onPress={connected ? disconnect : handleConnect}
          activeOpacity={0.8}
        >
          <View style={[styles.connectDot, { backgroundColor: connected ? Colors.green : Colors.error }]} />
          <Text style={[styles.connectText, connected && { color: Colors.green }]}>
            {connected ? 'Connected' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      {connected ? (
        <>
          {/* SOL Balance — primary */}
          <Animated.View style={pulseStyle}>
            <Text style={styles.balancePrimary}>
              {formatBalance(solBalance, 4)}
              <Text style={styles.balanceSymbol}> SOL</Text>
            </Text>
            <Text style={styles.balanceUSD}>≈ ${totalUSD} USD</Text>
          </Animated.View>

          {/* SKR Balance — secondary badge */}
          <View style={styles.skrRow}>
            <View style={styles.skrBadge}>
              <View style={styles.skrDot} />
              <Text style={styles.skrAmount}>{formatBalance(skrBalance, 0)} SKR</Text>
              <Text style={styles.skrLabel}>Seeker Token</Text>
            </View>
            <View style={styles.networkBadge}>
              <View style={[styles.connectDot, { backgroundColor: '#FFB800', width: 5, height: 5 }]} />
              <Text style={styles.networkText}>Devnet</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.disconnectedContent}>
          <Text style={styles.disconnectedText}>Connect wallet to view balance</Text>
          <TouchableOpacity style={styles.connectLargBtn} onPress={handleConnect} activeOpacity={0.85}>
            <Text style={styles.connectLargText}>Connect Wallet →</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

// ── Quick Action Button ────────────────────────────────
function QuickAction({ icon, label, onPress, delay = 0 }: {
  icon: React.ReactNode; label: string; onPress: () => void; delay?: number;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => { scale.value = withSpring(1); });
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.quickAction}>
      <Animated.View style={animStyle}>
        <View style={styles.quickActionIcon}>{icon}</View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Transaction Row ────────────────────────────────────
function TxRow({ tx, index }: { tx: any; index: number }) {
  const translateX = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, { damping: 14, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 350 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const isSent = tx.type === 'sent';
  const isSKR = tx.token === 'SKR';

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.txRow} activeOpacity={0.7}>
        <View style={[styles.txIcon, { backgroundColor: isSent ? 'rgba(255,77,109,0.1)' : 'rgba(20,241,149,0.1)' }]}>
          <Text style={{ fontSize: 18 }}>
            {isSent ? '↑' : '↓'}
          </Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txLabel}>{tx.label || shortenAddress(tx.address)}</Text>
          <Text style={styles.txTime}>{timeAgo(tx.timestamp)}</Text>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: isSent ? Colors.error : Colors.green }]}>
            {isSent ? '-' : '+'}{tx.amount} {tx.token}
          </Text>
          <View style={[styles.txStatus, {
            backgroundColor: tx.status === 'confirmed' ? 'rgba(20,241,149,0.1)' :
              tx.status === 'failed' ? 'rgba(255,77,109,0.1)' : 'rgba(255,215,0,0.1)'
          }]}>
            <Text style={[styles.txStatusText, {
              color: tx.status === 'confirmed' ? Colors.green :
                tx.status === 'failed' ? Colors.error : Colors.pending
            }]}>
              {tx.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Home Screen ───────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { transactions, connected } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const recentTxs = transactions.slice(0, 4);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Solanape 🐒</Text>
            <Text style={styles.headerSub}>UPI-style Solana payments</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.green}
            />
          }
        >
          {/* Balance Hero */}
          <BalanceHero />

          {/* Quick Actions — like PhonePe's Money Transfers */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              {connected && (
                <TouchableOpacity>
                  <Text style={styles.sectionLink}>Airdrop SOL →</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.quickGrid}>
              <QuickAction
                icon={<SendIcon />}
                label="Send"
                onPress={() => router.push('/send')}
                delay={0}
              />
              <QuickAction
                icon={<ReceiveIcon />}
                label="Receive"
                onPress={() => router.push('/receive')}
                delay={80}
              />
              <QuickAction
                icon={<ScanIcon />}
                label="Scan QR"
                onPress={() => router.push('/(tabs)/scan')}
                delay={160}
              />
              <QuickAction
                icon={<HistoryIcon />}
                label="History"
                onPress={() => router.push('/(tabs)/history')}
                delay={240}
              />
            </View>
          </Animated.View>

          {/* SKR Highlight Banner */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <TouchableOpacity style={styles.skrBanner} activeOpacity={0.85}>
              <View style={styles.skrBannerLeft}>
                <Text style={styles.skrBannerEmoji}>🔮</Text>
                <View>
                  <Text style={styles.skrBannerTitle}>Send SKR to Seeker users</Text>
                  <Text style={styles.skrBannerSub}>Native Seeker ecosystem token</Text>
                </View>
              </View>
              <Text style={styles.skrBannerArrow}>→</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Recent Transactions */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.sectionLink}>See all →</Text>
              </TouchableOpacity>
            </View>
            {recentTxs.length > 0 ? (
              recentTxs.map((tx, i) => (
                <TxRow key={tx.id} tx={tx} index={i} />
              ))
            ) : (
              <View style={styles.emptyTx}>
                <Text style={styles.emptyTxText}>No transactions yet</Text>
                <Text style={styles.emptyTxSub}>Send or receive SOL to get started</Text>
              </View>
            )}
          </Animated.View>

          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.screen },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.xxl,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.greenBorder,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroMesh: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  meshBlob: {
    position: 'absolute',
    width: 120, height: 120,
    borderRadius: 60,
    opacity: 0.08,
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0, width: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 1,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    zIndex: 2,
  },
  heroLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroAddress: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontFamily: 'monospace' },

  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,77,109,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,109,0.25)',
  },
  connectBtnActive: {
    backgroundColor: Colors.greenDim,
    borderColor: Colors.greenBorder,
  },
  connectDot: { width: 6, height: 6, borderRadius: 3 },
  connectText: { fontSize: 12, fontWeight: '600', color: Colors.error },

  balancePrimary: {
    fontSize: 42, fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1.5, zIndex: 2,
  },
  balanceSymbol: { fontSize: 22, fontWeight: '600', color: Colors.green },
  balanceUSD: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, zIndex: 2 },

  skrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    zIndex: 2,
  },
  skrBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.skrGoldDim,
    borderWidth: 1, borderColor: Colors.skrGoldBorder,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full,
  },
  skrDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.skrGold },
  skrAmount: { fontSize: 13, fontWeight: '700', color: Colors.skrGold },
  skrLabel: { fontSize: 11, color: 'rgba(255,184,0,0.6)', marginLeft: 2 },
  networkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,184,0,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,184,0,0.2)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  networkText: { fontSize: 11, color: Colors.skrGold, fontWeight: '600' },

  disconnectedContent: { alignItems: 'center', paddingVertical: 8 },
  disconnectedText: { color: Colors.textSecondary, fontSize: 14, marginBottom: 14 },
  connectLargBtn: {
    backgroundColor: Colors.green,
    paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: Radius.full,
  },
  connectLargText: { color: Colors.bg, fontWeight: '700', fontSize: 14 },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sectionLink: { fontSize: 13, color: Colors.green, fontWeight: '600' },

  // Quick Actions
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAction: { flex: 1, alignItems: 'center' },
  quickActionIcon: {
    width: 64, height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // SKR Banner
  skrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.skrGoldBorder,
  },
  skrBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skrBannerEmoji: { fontSize: 28 },
  skrBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  skrBannerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  skrBannerArrow: { fontSize: 18, color: Colors.skrGold, fontWeight: '700' },

  // Transactions
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  txIcon: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  txTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txStatus: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  txStatusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },

  emptyTx: { alignItems: 'center', paddingVertical: 32 },
  emptyTxText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  emptyTxSub: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});