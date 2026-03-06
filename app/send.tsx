import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useWallet } from '../src/hooks/useWallet';
import { useWalletStore } from '../src/stores/wallet-store';

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
  red: '#EF4444',
};

export default function Send() {
  const router = useRouter();
  const { sendSOL } = useWallet();
  const params = useLocalSearchParams<{ address?: string; amount?: string }>();

  const isConnected = useWalletStore((s) => s.isConnected);
  const balance = useWalletStore((s) => s.balance);

  const [address, setAddress] = useState(params.address ?? '');
  const [amount, setAmount] = useState(params.amount ?? '');
  const [token, setToken] = useState<'SOL' | 'SKR'>('SOL');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const isValidAddress = address.length >= 32 && address.length <= 44;
  const isValidAmount = parseFloat(amount) > 0 && !isNaN(parseFloat(amount));
  const hasEnoughBalance = balance != null && parseFloat(amount) <= balance;
  const canSend = isValidAddress && isValidAmount && hasEnoughBalance && isConnected;
  const cameFromQR = !!params.address;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const sig = await sendSOL(address, parseFloat(amount));
      setTxSignature(sig?.toString() ?? '');
      setSuccess(true);
    } catch (error: any) {
      Alert.alert(
        'Transaction Failed',
        error?.message ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successContainer}>
          <View style={s.successIconBox}>
            <Ionicons name="checkmark" size={56} color={C.green} />
          </View>
          <Text style={s.successTitle}>Sent! 🎉</Text>
          <Text style={s.successAmount}>
            {amount} <Text style={s.successToken}>{token}</Text>
          </Text>
          <Text style={s.successTo}>To</Text>
          <Text style={s.successAddr}>
            {address.slice(0, 8)}...{address.slice(-8)}
          </Text>
          {txSignature ? (
            <TouchableOpacity style={s.explorerBtn}>
              <Ionicons name="open-outline" size={16} color={C.purple} />
              <Text style={s.explorerBtnText}>View on Solscan</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
            <Text style={s.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── SEND SCREEN ──
  return (
    <SafeAreaView style={s.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={s.container}>

          {/* HEADER */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-down" size={24} color={C.text} />
            </TouchableOpacity>
            <Text style={s.title}>Send</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scrollContent}
          >
            {/* QR SCANNED BANNER — only shows when coming from QR scan */}
            {cameFromQR && isValidAddress && (
              <View style={s.scannedBanner}>
                <View style={s.scannedBannerLeft}>
                  <Ionicons name="checkmark-circle" size={20} color={C.green} />
                  <Text style={s.scannedBannerText}>Address fetched from QR</Text>
                </View>
                <Text style={s.scannedBannerAddr}>
                  {address.slice(0, 6)}...{address.slice(-6)}
                </Text>
              </View>
            )}

            {/* NOT CONNECTED WARNING */}
            {!isConnected && (
              <View style={s.warningBox}>
                <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                <Text style={s.warningText}>
                  Connect your wallet first to send SOL
                </Text>
              </View>
            )}

            {/* TOKEN TOGGLE */}
            <View style={s.tokenToggle}>
              {(['SOL', 'SKR'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    s.tokenBtn,
                    token === t && s.tokenBtnActive,
                    token === t && t === 'SKR' && s.tokenBtnSKR,
                  ]}
                  onPress={() => setToken(t)}
                >
                  <Text style={[s.tokenBtnText, token === t && s.tokenBtnTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AMOUNT INPUT */}
            <View style={s.amountBox}>
              <TextInput
                style={s.amountInput}
                value={amount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  if (parts.length <= 2) setAmount(cleaned);
                }}
                placeholder="0.00"
                placeholderTextColor={C.muted}
                keyboardType="decimal-pad"
                textAlign="center"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text style={s.amountToken}>{token}</Text>
              <Text style={s.balanceHint}>
                Available: {balance != null ? (balance ?? 0).toFixed(4) : '0.0000'} SOL
              </Text>
            </View>

            {/* QUICK AMOUNTS */}
            <View style={s.quickRow}>
              {['0.01', '0.05', '0.1', '0.5'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[s.quickBtn, amount === v && s.quickBtnActive]}
                  onPress={() => {
                    setAmount(v);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={[s.quickBtnText, amount === v && s.quickBtnTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ADDRESS INPUT */}
            <Text style={s.inputLabelText}>Recipient Address</Text>
            <View style={[
              s.inputBox,
              address.length > 0 && !isValidAddress && s.inputBoxError,
              address.length > 0 && isValidAddress && s.inputBoxSuccess,
            ]}>
              <Ionicons name="wallet-outline" size={18} color={C.muted} />
              <TextInput
                style={s.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter Solana wallet address"
                placeholderTextColor={C.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              {address.length > 0 && (
                <TouchableOpacity onPress={() => setAddress('')}>
                  <Ionicons name="close-circle" size={18} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* ERRORS */}
            {address.length > 0 && !isValidAddress && (
              <Text style={s.errorText}>Invalid Solana address</Text>
            )}
            {amount.length > 0 && isValidAmount && balance != null && !hasEnoughBalance && (
              <Text style={s.errorText}>
                Insufficient balance. You have {(balance ?? 0).toFixed(4)} SOL
              </Text>
            )}

            <Text style={s.fee}>Network fee: ~0.000005 SOL</Text>

            {/* SEND BUTTON */}
            <TouchableOpacity
              style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!canSend || sending}
            >
              {sending ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={s.sendBtnText}>Sending...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="arrow-up-circle-outline" size={22} color="#fff" />
                  <Text style={s.sendBtnText}>
                    Send {amount || '0'} {token}
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: C.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scannedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20,241,149,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20,241,149,0.3)',
  },
  scannedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scannedBannerText: {
    color: C.green,
    fontSize: 13,
    fontWeight: '600',
  },
  scannedBannerAddr: {
    color: C.green,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  warningText: {
    color: '#F59E0B',
    fontSize: 13,
    flex: 1,
  },
  tokenToggle: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  tokenBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tokenBtnActive: {
    backgroundColor: C.purple,
  },
  tokenBtnSKR: {
    backgroundColor: C.skr,
  },
  tokenBtnText: {
    color: C.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  tokenBtnTextActive: {
    color: '#fff',
  },
  amountBox: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  amountInput: {
    color: C.text,
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: -2,
    minWidth: 150,
    textAlign: 'center',
  },
  amountToken: {
    color: C.sub,
    fontSize: 18,
    marginTop: 4,
  },
  balanceHint: {
    color: C.muted,
    fontSize: 13,
    marginTop: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  quickBtnActive: {
    backgroundColor: C.purple,
    borderColor: C.purple,
  },
  quickBtnText: {
    color: C.sub,
    fontSize: 13,
    fontWeight: '600',
  },
  quickBtnTextActive: {
    color: '#fff',
  },
  inputLabelText: {
    color: C.sub,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
    marginBottom: 6,
  },
  inputBoxError: {
    borderColor: C.red,
  },
  inputBoxSuccess: {
    borderColor: C.green,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 14,
  },
  errorText: {
    color: C.red,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  fee: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.purple,
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 8,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  successIconBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(20,241,149,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.green,
    marginBottom: 8,
  },
  successTitle: {
    color: C.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  successAmount: {
    color: C.green,
    fontSize: 40,
    fontWeight: 'bold',
  },
  successToken: {
    color: C.green,
    fontSize: 24,
  },
  successTo: {
    color: C.muted,
    fontSize: 14,
  },
  successAddr: {
    color: C.sub,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.purple,
    marginTop: 8,
  },
  explorerBtnText: {
    color: C.purple,
    fontSize: 14,
    fontWeight: '600',
  },
  doneBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});