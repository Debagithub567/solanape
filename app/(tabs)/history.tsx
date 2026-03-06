import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useWalletStore, Transaction } from '../../../src/stores/wallet-store';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { shortenAddress, timeAgo, getTxExplorerUrl } from '../../utils/solana';

type Filter = 'all' | 'sent' | 'received' | 'SOL' | 'SKR';

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withSpring(0.93, {}, () => { scale.value = withSpring(1); });
        onPress();
      }}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.filterChip, active && styles.filterChipActive, animStyle]}>
        <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function TxCard({ tx, index }: { tx: Transaction; index: number }) {
  const isSent = tx.type === 'sent';
  const isSKR = tx.token === 'SKR';
  const statusColor = tx.status === 'confirmed' ? Colors.green : tx.status === 'failed' ? Colors.error : Colors.warning;
  const amountColor = isSent ? Colors.error : Colors.green;

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(280)}>
      <TouchableOpacity
        style={styles.txCard}
        onPress={() => tx.txSignature && Linking.openURL(getTxExplorerUrl(tx.txSignature))}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={[styles.txIcon, { backgroundColor: isSent ? 'rgba(255,77,109,0.12)' : 'rgba(20,241,149,0.12)' }]}>
          <Text style={{ fontSize: 20, color: amountColor }}>{isSent ? '↑' : '↓'}</Text>
        </View>

        {/* Info */}
        <View style={styles.txInfo}>
          <View style={styles.txTopRow}>
            <Text style={styles.txLabel} numberOfLines={1}>
              {tx.label || shortenAddress(tx.address)}
            </Text>
            <Text style={[styles.txAmount, { color: amountColor }]}>
              {isSent ? '-' : '+'}{tx.amount} {tx.token}
            </Text>
          </View>
          <View style={styles.txBottomRow}>
            <Text style={styles.txTime}>{timeAgo(tx.timestamp)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{tx.status}</Text>
            </View>
          </View>
          {isSKR && (
            <View style={styles.skrTag}>
              <Text style={styles.skrTagText}>🔮 Seeker Token</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { transactions } = useWalletStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.type === 'sent';
    if (filter === 'received') return tx.type === 'received';
    if (filter === 'SOL') return tx.token === 'SOL';
    if (filter === 'SKR') return tx.token === 'SKR';
    return true;
  });

  const totalSent = transactions.filter(t => t.type === 'sent' && t.status === 'confirmed')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalReceived = transactions.filter(t => t.type === 'received' && t.status === 'confirmed')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.sub}>All your transactions</Text>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sent</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>{totalSent.toFixed(4)}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Colors.greenBorder }]}>
            <Text style={styles.statLabel}>Total Received</Text>
            <Text style={[styles.statValue, { color: Colors.green }]}>{totalReceived.toFixed(4)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{transactions.length}</Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <View style={styles.filters}>
            {(['all', 'sent', 'received', 'SOL', 'SKR'] as Filter[]).map(f => (
              <FilterChip key={f} label={f === 'all' ? 'All' : f} active={filter === f} onPress={() => setFilter(f)} />
            ))}
          </View>
        </Animated.View>

        <FlatList
          data={filtered}
          keyExtractor={tx => tx.id}
          renderItem={({ item, index }) => <TxCard tx={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No transactions</Text>
              <Text style={styles.emptySub}>Your transaction history will appear here</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.screen, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  statsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: Spacing.screen, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '800' },

  filters: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.screen,
    marginBottom: 12, flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.greenDim, borderColor: Colors.greenBorder },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
  filterTextActive: { color: Colors.green },

  list: { paddingHorizontal: Spacing.screen, paddingBottom: 100 },

  txCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  txIcon: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  txInfo: { flex: 1 },
  txTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  txLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txTime: { fontSize: 12, color: Colors.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  skrTag: {
    marginTop: 5, alignSelf: 'flex-start',
    backgroundColor: Colors.skrGoldDim, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.skrGoldBorder,
  },
  skrTagText: { fontSize: 11, color: Colors.skrGold, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
});