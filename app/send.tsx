import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, FadeInDown, SlideInRight, SlideOutLeft,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useWalletStore } from '../src/stores/wallet-store';
import { Colors, Spacing, Radius, Fonts } from '../constants/theme';
import {
  shortenAddress, isValidSolanaAddress, mockSendSOL, mockSendSKR, formatBalance
} from '../utils/solana';

const { width: SW } = Dimensions.get('window');

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TokenTab = ({ token, selected, onPress }: { token: 'SOL' | 'SKR'; selected: boolean; onPress: () => void }) => {
  const scale = useSharedValue(selected ? 1 : 0.97);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
      <Animated.View style={[
        styles.tokenTab,
        selected && (token === 'SOL' ? styles.tokenTabActiveSol : styles.tokenTabActiveSkr),
        animStyle,
      ]}>
        <Text style={[styles.tokenTabEmoji]}>{token === 'SOL' ? '◎' : '🔮'}</Text>
        <Text style={[styles.tokenTabText, selected && { color: token === 'SOL' ? Colors.green : Colors.skrGold }]}>
          {token}
        </Text>
        {selected && <View style={[styles.tokenTabDot, { backgroundColor: token === 'SOL' ? Colors.green : Colors.skrGold }]} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

function ContactChip({ contact, onPress }: { contact: any; onPress: () => void }) {
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
      <Animated.View style={[styles.contactChip, animStyle]}>
        <Text style={styles.contactEmoji}>{contact.emoji}</Text>
        <Text style={styles.contactName} numberOfLines={1}>{contact.name.split(' ')[0]}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Number pad button
function NumPadBtn({ label, onPress }: { label: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withSpring(0.88, { damping: 10 }, () => { scale.value = withSpring(1); });
        onPress();
      }}
      activeOpacity={0.8}
      style={{ flex: 1, aspectRatio: 1.3, maxHeight: 64 }}
    >
      <Animated.View style={[styles.numPadBtn, animStyle]}>
        <Text style={styles.numPadText}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function SendScreen() {
  const router = useRouter();
  const { contacts, solBalance, skrBalance, publicKey, connected, addTransaction } = useWalletStore();

  const [token, setToken] = useState<'SOL' | 'SKR'>('SOL');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const isValidAddress = isValidSolanaAddress(toAddress) || toAddress.length === 0;
  const hasAddress = toAddress.length > 0 && isValidSolanaAddress(toAddress);
  const hasAmount = parseFloat(amount) > 0;
  const canSend = connected && hasAddress && hasAmount && !sending;

  const maxBalance = token === 'SOL' ? solBalance : skrBalance;

  const handleNumPad = (val: string) => {
    if (val === '⌫') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    if (val === '.' && amount.includes('.')) return;
    if (val === '.' && amount === '') { setAmount('0.'); return; }
    const next = amount + val;
    if (parseFloat(next) > maxBalance) return;
    if (amount.includes('.') && amount.split('.')[1]?.length >= 6) return;
    setAmount(next);
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const result = token === 'SOL'
        ? await mockSendSOL(publicKey!, toAddress, parseFloat(amount))
        : await mockSendSKR(publicKey!, toAddress, parseFloat(amount));

      const newTx = {
        id: Date.now().toString(),
        type: 'sent' as const,
        token,
        amount,
        address: toAddress,
        label: selectedContact?.name,
        timestamp: new Date(),
        status: result.status,
        txSignature: result.signature,
      };
      addTransaction(newTx);

      router.push({
        pathname: '/confirm',
        params: {
          status: result.status,
          amount,
          token,
          toAddress: shortenAddress(toAddress),
          toAddressFull: toAddress,
          txSignature: result.signature,
          label: selectedContact?.name || '',
        }
      });
    } catch (err) {
      Alert.alert('Error', 'Transaction failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSelectContact = (c: any) => {
    setSelectedContact(c);
    setToAddress(c.address);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Payment</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Token selector */}
            <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.tokenRow}>
              <TokenTab token="SOL" selected={token === 'SOL'} onPress={() => setToken('SOL')} />
              <TokenTab token="SKR" selected={token === 'SKR'} onPress={() => setToken('SKR')} />
            </Animated.View>

            {/* Balance indicator */}
            <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available:</Text>
              <Text style={[styles.balanceVal, { color: token === 'SOL' ? Colors.green : Colors.skrGold }]}>
                {formatBalance(maxBalance)} {token}
              </Text>
            </Animated.View>

            {/* To address */}
            <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>To</Text>
              <View style={[styles.inputWrap, !isValidAddress && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Wallet address or scan QR"
                  placeholderTextColor={Colors.textMuted}
                  value={toAddress}
                  onChangeText={t => { setToAddress(t); setSelectedContact(null); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                />
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/scan')}
                  style={styles.scanBtn}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>⊞</Text>
                </TouchableOpacity>
              </View>
              {!isValidAddress && toAddress.length > 0 && (
                <Text style={styles.errorText}>Invalid Solana address</Text>
              )}
            </Animated.View>

            {/* Recent contacts */}
            <Animated.View entering={FadeInDown.delay(250).duration(300)}>
              <Text style={styles.inputLabel}>Recent</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactScroll}>
                {contacts.map(c => (
                  <ContactChip key={c.id} contact={c} onPress={() => handleSelectContact(c)} />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Amount display */}
            <Animated.View entering={FadeInDown.delay(300).duration(300)} style={styles.amountDisplay}>
              <Text style={styles.amountText}>
                {amount || '0'}
                <Text style={[styles.amountToken, { color: token === 'SOL' ? Colors.green : Colors.skrGold }]}>
                  {' '}{token}
                </Text>
              </Text>
              {amount && parseFloat(amount) > 0 && token === 'SOL' && (
                <Text style={styles.amountUSD}>
                  ≈ ${(parseFloat(amount) * 148.23).toFixed(2)} USD
                </Text>
              )}
              <TouchableOpacity onPress={() => setAmount(formatBalance(maxBalance * 0.99, 4))}>
                <Text style={styles.maxBtn}>MAX</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Number pad */}
            <Animated.View entering={FadeInDown.delay(350).duration(300)} style={styles.numPad}>
              {[
                ['1','2','3'],
                ['4','5','6'],
                ['7','8','9'],
                ['.','0','⌫'],
              ].map((row, ri) => (
                <View key={ri} style={styles.numRow}>
                  {row.map(k => (
                    <NumPadBtn key={k} label={k} onPress={() => handleNumPad(k)} />
                  ))}
                </View>
              ))}
            </Animated.View>

            {/* Send button */}
            <Animated.View entering={FadeInDown.delay(400).duration(300)}>
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  canSend ? styles.sendBtnActive : styles.sendBtnDisabled,
                  token === 'SKR' && canSend && styles.sendBtnSKR,
                ]}
                onPress={handleSend}
                disabled={!canSend}
                activeOpacity={0.85}
              >
                {sending ? (
                  <Text style={styles.sendBtnText}>Sending...</Text>
                ) : (
                  <Text style={styles.sendBtnText}>
                    {connected ? `Send ${token}` : 'Connect Wallet First'}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.screen, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  // Token tabs
  tokenRow: {
    flexDirection: 'row', gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 5,
    marginBottom: 12,
  },
  tokenTab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, gap: 6,
    borderRadius: Radius.md,
  },
  tokenTabActiveSol: {
    backgroundColor: Colors.greenDim,
    borderWidth: 1, borderColor: Colors.greenBorder,
  },
  tokenTabActiveSkr: {
    backgroundColor: Colors.skrGoldDim,
    borderWidth: 1, borderColor: Colors.skrGoldBorder,
  },
  tokenTabEmoji: { fontSize: 16 },
  tokenTabText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  tokenTabDot: { width: 5, height: 5, borderRadius: 3 },

  balanceRow: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    marginBottom: 16, justifyContent: 'flex-end',
  },
  balanceLabel: { fontSize: 12, color: Colors.textMuted },
  balanceVal: { fontSize: 13, fontWeight: '700' },

  // Input
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 4,
    minHeight: 52,
  },
  inputError: { borderColor: Colors.error },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontFamily: 'monospace', paddingVertical: 8 },
  scanBtn: { paddingLeft: 10 },
  errorText: { fontSize: 11, color: Colors.error, marginTop: 4, marginLeft: 4 },

  contactScroll: { marginBottom: 20 },
  contactChip: {
    alignItems: 'center', marginRight: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
    minWidth: 64,
  },
  contactEmoji: { fontSize: 22, marginBottom: 4 },
  contactName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  // Amount
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 52, fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  amountToken: { fontSize: 24, fontWeight: '600' },
  amountUSD: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  maxBtn: {
    fontSize: 12, color: Colors.green, fontWeight: '700',
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: Colors.greenDim, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.greenBorder,
  },

  // Numpad
  numPad: { marginBottom: 20 },
  numRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  numPadBtn: {
    flex: 1, aspectRatio: 1.3, maxHeight: 64,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  numPadText: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },

  // Send button
  sendBtn: {
    height: 58, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: Colors.green },
  sendBtnSKR: { backgroundColor: Colors.skrGold },
  sendBtnDisabled: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  sendBtnText: { fontSize: 17, fontWeight: '700', color: Colors.bg },
});