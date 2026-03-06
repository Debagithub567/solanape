import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWallet } from '../../src/hooks/useWallet';

const C = {
  bg: '#0D0D12',
  card: '#1A1A24',
  purple: '#7C3AED',
  green: '#14F195',
  skr: '#9945FF',
  border: 'rgba(124,58,237,0.25)',
  text: '#FFFFFF',
  sub: '#AAAAAA',
  muted: '#555555',
};

const recentTx = [
  { id: '1', type: 'sent',     name: 'Alex',      amount: '0.05', time: '2 min ago' },
  { id: '2', type: 'received', name: 'Luna',       amount: '0.10', time: '1 hr ago'  },
  { id: '3', type: 'sent',     name: 'CoffeeShop', amount: '0.02', time: 'Yesterday' },
];

export default function Home() {
  const router = useRouter();
  const {
    connected,
    connecting,
    connect,
    disconnect,
    publicKey,
    balance,
    lastBalance,
    lastConnectedTime,
  } = useWallet();

  const shortKey = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  const handleConnect = async () => {
    try {
      await connect();
    } catch (e) {
      console.log('Connection cancelled');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <View style={s.logoBox}>
              <Text style={s.logoText}>SP</Text>
            </View>
            <Text style={s.appName}>SolanaPe</Text>
          </View>

          {connected ? (
            <TouchableOpacity style={s.connectedBtn} onPress={disconnect}>
              <View style={s.greenDot} />
              <Text style={s.connectedText}>{shortKey}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={s.connectBtn}
              onPress={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="wallet-outline" size={15} color="#fff" />
              )}
              <Text style={s.connectBtnText}>
                {connecting ? 'Connecting...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BALANCE CARD */}
        {connected ? (
          <View style={s.balanceCard}>
            <Text style={s.balanceLabel}>TOTAL BALANCE</Text>
            <Text style={s.balanceAmount}>
              {balance !== null ? balance.toFixed(4) : '...'}
              <Text style={s.balanceSOL}> SOL</Text>
            </Text>
            <Text style={s.balanceUSD}>
              ≈ ₹{balance !== null
                ? (balance * 13000).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                : '0'}
            </Text>
            <View style={s.balancePills}>
              <View style={s.pill}>
                <View style={[s.pillDot, { backgroundColor: C.green }]} />
                <Text style={s.pillText}>Connected</Text>
              </View>
              <TouchableOpacity style={s.pill} onPress={disconnect}>
                <Ionicons name="log-out-outline" size={12} color={C.sub} />
                <Text style={s.pillText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.disconnectedCard}>
            {lastBalance !== null ? (
              <>
                <Text style={s.balanceLabel}>LAST BALANCE</Text>
                <Text style={s.lastBalanceAmount}>
                  {lastBalance.toFixed(4)}
                  <Text style={s.lastBalanceSOL}> SOL</Text>
                </Text>
                <Text style={s.lastConnectedText}>
                  Last connected at {lastConnectedTime}
                </Text>
                <TouchableOpacity
                  style={s.connectBtnLarge}
                  onPress={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="wallet-outline" size={20} color="#fff" />
                  )}
                  <Text style={s.connectBtnLargeText}>
                    {connecting ? 'Connecting...' : 'Reconnect Wallet'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="wallet-outline" size={52} color={C.purple} />
                <Text style={s.notConnectedTitle}>Connect Your Wallet</Text>
                <Text style={s.notConnectedSub}>
                  Tap below to connect Phantom and see your SOL balance
                </Text>
                <TouchableOpacity
                  style={s.connectBtnLarge}
                  onPress={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="wallet-outline" size={20} color="#fff" />
                  )}
                  <Text style={s.connectBtnLargeText}>
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* QUICK ACTIONS */}
        <View style={s.actionsRow}>
          {[
            {
              icon: 'arrow-up-circle-outline',
              label: 'Send',
              color: C.purple,
              route: '/send',
            },
            {
              icon: 'arrow-down-circle-outline',
              label: 'Receive',
              color: C.green,
              route: '/receive',
            },
            {
              icon: 'scan-outline',
              label: 'Scan',
              color: '#F59E0B',
              route: '/(tabs)/scan',
            },
            {
              icon: 'time-outline',
              label: 'History',
              color: C.skr,
              route: '/(tabs)/history',
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.actionItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.actionIcon, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={s.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT ACTIVITY */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/history' as any)}
            >
              <Text style={s.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTx.map((tx) => (
            <View key={tx.id} style={s.txRow}>
              <View
                style={[
                  s.txIcon,
                  {
                    backgroundColor:
                      tx.type === 'sent'
                        ? 'rgba(124,58,237,0.15)'
                        : 'rgba(20,241,149,0.15)',
                  },
                ]}
              >
                <Ionicons
                  name={
                    tx.type === 'sent'
                      ? 'arrow-up-outline'
                      : 'arrow-down-outline'
                  }
                  size={20}
                  color={tx.type === 'sent' ? C.purple : C.green}
                />
              </View>
              <View style={s.txInfo}>
                <Text style={s.txName}>{tx.name}</Text>
                <Text style={s.txTime}>{tx.time}</Text>
              </View>
              <Text
                style={[
                  s.txAmount,
                  { color: tx.type === 'sent' ? C.sub : C.green },
                ]}
              >
                {tx.type === 'sent' ? '-' : '+'}
                {tx.amount} SOL
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  appName: {
    color: C.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.purple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  connectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,241,149,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20,241,149,0.3)',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  connectedText: {
    color: C.green,
    fontSize: 13,
    fontWeight: '600',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  balanceLabel: {
    color: C.sub,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  balanceAmount: {
    color: C.text,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  balanceSOL: {
    color: C.green,
    fontSize: 24,
  },
  balanceUSD: {
    color: C.sub,
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  balancePills: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0D0D12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    color: C.sub,
    fontSize: 12,
  },
  disconnectedCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    gap: 12,
  },
  lastBalanceAmount: {
    color: C.muted,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  lastBalanceSOL: {
    color: C.muted,
    fontSize: 24,
  },
  lastConnectedText: {
    color: C.muted,
    fontSize: 13,
  },
  notConnectedTitle: {
    color: C.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  notConnectedSub: {
    color: C.sub,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  connectBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.purple,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  connectBtnLargeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: C.sub,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: C.purple,
    fontSize: 14,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 14,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  txTime: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
});