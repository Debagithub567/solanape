import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useWalletStore } from '../src/stores/wallet-store';
import QRCode from 'react-native-qrcode-svg';

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

export default function Receive() {
  const router = useRouter();
  const publicKey = useWalletStore((s) => s.publicKey);
  const isConnected = useWalletStore((s) => s.isConnected);

  // Solana Pay format — scannable by any Solana wallet
  const qrValue = publicKey ? `solana:${publicKey}` : '';

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`
    : 'Not connected';

  const handleCopy = async () => {
    if (!publicKey) return;
    await Clipboard.setStringAsync(publicKey);
    Alert.alert('Copied!', 'Wallet address copied to clipboard.');
  };

  const handleShare = async () => {
    if (!publicKey) return;
    await Share.share({
      message: `Send me SOL on SolanaPe!\n\nWallet Address:\n${publicKey}\n\nOr scan my QR code in SolanaPe 🚀`,
      title: 'My SolanaPe Address',
    });
  };

  const handleWhatsApp = async () => {
    if (!publicKey) return;
    const message = encodeURIComponent(
      `Send me SOL on SolanaPe! 🚀\n\nMy wallet address:\n${publicKey}`
    );
    const { Linking } = require('react-native');
    try {
      await Linking.openURL(`whatsapp://send?text=${message}`);
    } catch {
      Alert.alert('WhatsApp not installed', 'Please use the Share button instead.');
    }
  };

  return (
    <SafeAreaView style={s.safe}>

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={s.title}>Receive Tips</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.body}>
        <Text style={s.subtitle}>
          Show this QR to receive SOL instantly
        </Text>

        {/* QR CODE */}
        <View style={s.qrCard}>
          {isConnected && publicKey ? (
            <>
              <QRCode
                value={qrValue}
                size={220}
                color={C.purple}
                backgroundColor="#FFFFFF"
              />
              <Text style={s.qrHint}>Scan with any Solana wallet</Text>
            </>
          ) : (
            <View style={s.qrPlaceholder}>
              <Ionicons name="wallet-outline" size={48} color={C.muted} />
              <Text style={s.qrPlaceholderText}>
                Connect wallet to generate QR
              </Text>
            </View>
          )}
        </View>

        {/* ADDRESS BOX */}
        <TouchableOpacity style={s.addressBox} onPress={handleCopy}>
          <View style={s.addressInner}>
            <Text style={s.addressLabel}>Your Address</Text>
            <Text style={s.addressText} numberOfLines={1}>
              {publicKey ?? 'Not connected'}
            </Text>
          </View>
          <Ionicons name="copy-outline" size={20} color={C.purple} />
        </TouchableOpacity>

        {/* ACTION BUTTONS */}
        <TouchableOpacity style={s.copyBtn} onPress={handleCopy}>
          <Ionicons name="copy-outline" size={20} color={C.text} />
          <Text style={s.copyBtnText}>Copy Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={s.shareBtnText}>Share Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.whatsappBtn} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#fff" />
          <Text style={s.whatsappBtnText}>Share on WhatsApp</Text>
        </TouchableOpacity>

      </View>
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
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
    gap: 14,
  },
  subtitle: {
    color: C.sub,
    fontSize: 15,
    textAlign: 'center',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  qrHint: {
    color: C.muted,
    fontSize: 12,
    marginTop: 4,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  qrPlaceholderText: {
    color: C.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    width: '100%',
    gap: 12,
  },
  addressInner: {
    flex: 1,
    gap: 4,
  },
  addressLabel: {
    color: C.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressText: {
    color: C.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: C.border,
  },
  copyBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: C.border,
  },
  shareBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
  },
  whatsappBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});