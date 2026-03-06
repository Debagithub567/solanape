import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const C = { bg: '#0D0D12', card: '#1A1A24', purple: '#7C3AED', green: '#14F195', border: 'rgba(124,58,237,0.25)', text: '#FFFFFF', sub: '#AAAAAA', muted: '#555555' };

export default function Profile() {
  const [vendorMode, setVendorMode] = useState(false);
  const address = '7xKp9mNqRtWzXpLmQsVbDfGhJkNoPqRs';
  const short = `${address.slice(0, 8)}...${address.slice(-8)}`;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Wallet</Text>
      </View>

      {/* Wallet card */}
      <View style={s.walletCard}>
        <View style={s.avatarRow}>
          <View style={s.avatar}>
            <Ionicons name="person-outline" size={32} color={C.purple} />
          </View>
          <View>
            <Text style={s.walletLabel}>Connected Wallet</Text>
            <Text style={s.walletAddr}>{short}</Text>
          </View>
        </View>
        <View style={s.walletActions}>
          <TouchableOpacity style={s.walletBtn}>
            <Ionicons name="copy-outline" size={16} color={C.text} />
            <Text style={s.walletBtnText}>Copy Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.walletBtn}>
            <Ionicons name="share-outline" size={16} color={C.text} />
            <Text style={s.walletBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings list */}
      <View style={s.settingsList}>

        {/* Vendor Mode toggle */}
        <View style={s.settingRow}>
          <View style={s.settingLeft}>
            <View style={[s.settingIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Ionicons name="storefront-outline" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={s.settingTitle}>Vendor Mode</Text>
              <Text style={s.settingDesc}>Show payment QR to receive</Text>
            </View>
          </View>
          <Switch
            value={vendorMode}
            onValueChange={setVendorMode}
            trackColor={{ false: '#333', true: C.purple }}
            thumbColor={vendorMode ? C.green : '#888'}
          />
        </View>

        <TouchableOpacity style={s.settingRow}>
          <View style={s.settingLeft}>
            <View style={[s.settingIcon, { backgroundColor: 'rgba(20,241,149,0.15)' }]}>
              <Ionicons name="globe-outline" size={20} color={C.green} />
            </View>
            <View>
              <Text style={s.settingTitle}>Network</Text>
              <Text style={s.settingDesc}>Devnet</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.settingRow}>
          <View style={s.settingLeft}>
            <View style={[s.settingIcon, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={C.purple} />
            </View>
            <View>
              <Text style={s.settingTitle}>Security</Text>
              <Text style={s.settingDesc}>Seed Vault enabled</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.settingRow, { borderBottomWidth: 0 }]}>
          <View style={s.settingLeft}>
            <View style={[s.settingIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={[s.settingTitle, { color: '#EF4444' }]}>Disconnect Wallet</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Vendor dashboard — shown when vendor mode ON */}
      {vendorMode && (
        <View style={s.vendorCard}>
          <Text style={s.vendorTitle}>📊 Today's Earnings</Text>
          <Text style={s.vendorAmount}>0.35 SOL</Text>
          <Text style={s.vendorSub}>4 payments received today</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  header:        { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title:         { color: C.text, fontSize: 24, fontWeight: 'bold' },
  walletCard:    { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  avatarRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar:        { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(124,58,237,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  walletLabel:   { color: C.sub, fontSize: 12, marginBottom: 4 },
  walletAddr:    { color: C.text, fontSize: 14, fontFamily: 'monospace', fontWeight: '600' },
  walletActions: { flexDirection: 'row', gap: 10 },
  walletBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0D0D12', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  walletBtnText: { color: C.text, fontSize: 13, fontWeight: '500' },
  settingsList:  { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  settingRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settingLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon:   { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTitle:  { color: C.text, fontSize: 15, fontWeight: '600' },
  settingDesc:   { color: C.muted, fontSize: 12, marginTop: 2 },
  vendorCard:    { marginHorizontal: 20, marginTop: 16, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', alignItems: 'center' },
  vendorTitle:   { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  vendorAmount:  { color: '#F59E0B', fontSize: 36, fontWeight: 'bold' },
  vendorSub:     { color: C.sub, fontSize: 13, marginTop: 4 },
});