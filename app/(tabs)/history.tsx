import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#0D0D12',
  card: '#1A1A24',
  purple: '#7C3AED',
  green: '#14F195',
  border: 'rgba(124,58,237,0.25)',
  text: '#FFFFFF',
  sub: '#AAAAAA',
  muted: '#555555',
};

const TX = [
  { id: '1', type: 'sent',     name: 'Alex',      addr: '7xKp...3mNq', amount: '0.05', time: '2 min ago'  },
  { id: '2', type: 'received', name: 'Luna',       addr: '9pRt...7wXz', amount: '0.10', time: '1 hr ago'   },
  { id: '3', type: 'sent',     name: 'CoffeeShop', addr: '3jMn...5kLp', amount: '0.02', time: '3 hrs ago'  },
  { id: '4', type: 'received', name: 'Felix',      addr: '2bQs...8nVw', amount: '0.25', time: 'Yesterday'  },
  { id: '5', type: 'sent',     name: 'Sarah',      addr: '6fHg...1eDr', amount: '0.01', time: 'Yesterday'  },
  { id: '6', type: 'sent',     name: 'Vendor QR',  addr: '4cTu...9oYa', amount: '0.08', time: '2 days ago' },
];

const totalSent = TX
  .filter(t => t.type === 'sent')
  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  .toFixed(2);

const totalReceived = TX
  .filter(t => t.type === 'received')
  .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  .toFixed(2);

export default function History() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Transaction History</Text>
      </View>

      {/* Summary cards */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <View style={s.summaryIconRow}>
            <View style={[s.summaryIcon, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
              <Ionicons name="arrow-up-outline" size={16} color={C.purple} />
            </View>
            <Text style={s.summaryLabel}>Total Sent</Text>
          </View>
          <Text style={[s.summaryValue, { color: C.purple }]}>{totalSent} SOL</Text>
        </View>
        <View style={s.summaryCard}>
          <View style={s.summaryIconRow}>
            <View style={[s.summaryIcon, { backgroundColor: 'rgba(20,241,149,0.15)' }]}>
              <Ionicons name="arrow-down-outline" size={16} color={C.green} />
            </View>
            <Text style={s.summaryLabel}>Total Received</Text>
          </View>
          <Text style={[s.summaryValue, { color: C.green }]}>{totalReceived} SOL</Text>
        </View>
      </View>

      <FlatList
        data={TX}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.txRow} activeOpacity={0.7}>
            <View style={[s.txIcon, {
              backgroundColor: item.type === 'sent'
                ? 'rgba(124,58,237,0.15)'
                : 'rgba(20,241,149,0.15)',
            }]}>
              <Ionicons
                name={item.type === 'sent' ? 'arrow-up-outline' : 'arrow-down-outline'}
                size={22}
                color={item.type === 'sent' ? C.purple : C.green}
              />
            </View>
            <View style={s.txInfo}>
              <Text style={s.txName}>{item.name}</Text>
              <Text style={s.txAddr}>{item.addr}</Text>
              <Text style={s.txTime}>{item.time}</Text>
            </View>
            <View style={s.txRight}>
              <Text style={[s.txAmount, { color: item.type === 'sent' ? C.sub : C.green }]}>
                {item.type === 'sent' ? '-' : '+'}{item.amount}
              </Text>
              <Text style={s.txSOL}>SOL</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    color: C.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  summaryIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    color: C.sub,
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 3,
  },
  txName: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
  txAddr: {
    color: C.muted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  txTime: {
    color: C.muted,
    fontSize: 11,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  txSOL: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
});