import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat,
  withSequence, withTiming, FadeIn, FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Path } from 'react-native-svg';
import { useWalletStore } from '../src/stores/wallet-store';
import { Colors, Spacing, Radius } from '../constants/theme';
import { shortenAddress } from '../utils/solana';

const { width: SW } = Dimensions.get('window');
const QR_SIZE = SW - 120;

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ReceiveScreen() {
  const router = useRouter();
  const { connected, publicKey, solBalance, skrBalance } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<'SOL' | 'SKR'>('SOL');

  const qrScale = useSharedValue(0.85);
  const qrOpacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    qrScale.value = withSpring(1, { damping: 14 });
    qrOpacity.value = withTiming(1, { duration: 500 });
    pulse.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1, true
    );
  }, []);

  const qrStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qrScale.value }],
    opacity: qrOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleCopy = async () => {
    if (!publicKey) return;
    await Clipboard.setStringAsync(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!publicKey) return;
    await Share.share({
      message: `Send SOL or SKR to my Solanape wallet:\n${publicKey}`,
    });
  };

  const displayAddress = publicKey || 'Connect wallet to show QR';
  const qrValue = publicKey ? `solana:${publicKey}` : 'solanape://connect';

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receive Payment</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={styles.content}>
          {/* Token selector */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.tokenRow}>
            {(['SOL', 'SKR'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tokenBtn, token === t && (t === 'SOL' ? styles.tokenBtnActiveSol : styles.tokenBtnActiveSKR)]}
                onPress={() => setToken(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tokenBtnText, token === t && { color: t === 'SOL' ? Colors.green : Colors.skrGold }]}>
                  {t === 'SOL' ? '◎' : '🔮'} {t}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* QR Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={qrStyle}>
            <Animated.View style={[styles.qrCard, pulseStyle]}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              <View style={styles.qrWrap}>
                <QRCode
                  value={qrValue}
                  size={QR_SIZE - 40}
                  color="#FFFFFF"
                  backgroundColor="transparent"
                  quietZone={10}
                />
              </View>

              {/* Solanape logo overlay at center */}
              <View style={styles.qrLogo}>
                <Text style={styles.qrLogoText}>🐒</Text>
              </View>

              <View style={styles.qrBadge}>
                <View style={[styles.qrDot, { backgroundColor: token === 'SKR' ? Colors.skrGold : Colors.green }]} />
                <Text style={[styles.qrBadgeText, { color: token === 'SKR' ? Colors.skrGold : Colors.green }]}>
                  {token} · Devnet
                </Text>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Address */}
          <Animated.View entering={FadeInDown.delay(350).duration(300)} style={styles.addressCard}>
            <Text style={styles.addressLabel}>Your Wallet Address</Text>
            <Text style={styles.addressText} numberOfLines={2} selectable>
              {displayAddress}
            </Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(450).duration(300)} style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, copied && styles.actionBtnCopied]}
              onPress={handleCopy}
              activeOpacity={0.8}
              disabled={!publicKey}
            >
              <Text style={styles.actionBtnText}>{copied ? '✓ Copied!' : 'Copy Address'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleShare}
              activeOpacity={0.8}
              disabled={!publicKey}
            >
              <Text style={styles.actionBtnSecText}>Share ↑</Text>
            </TouchableOpacity>
          </Animated.View>

          {!connected && (
            <Animated.View entering={FadeInDown.delay(500)} style={styles.connectHint}>
              <Text style={styles.connectHintText}>
                ↑ Connect wallet on Home to activate your QR
              </Text>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  content: { flex: 1, paddingHorizontal: Spacing.screen, alignItems: 'center' },

  tokenRow: {
    flexDirection: 'row', gap: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: 5,
    marginBottom: 24, alignSelf: 'stretch',
  },
  tokenBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    alignItems: 'center',
  },
  tokenBtnActiveSol: { backgroundColor: Colors.greenDim, borderWidth: 1, borderColor: Colors.greenBorder },
  tokenBtnActiveSKR: { backgroundColor: Colors.skrGoldDim, borderWidth: 1, borderColor: Colors.skrGoldBorder },
  tokenBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },

  qrCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xxl, borderWidth: 1,
    borderColor: Colors.border,
    padding: 20, alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    width: QR_SIZE,
  },
  corner: {
    position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: Colors.green,
  },
  cornerTL: { top: 12, left: 12, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 6 },
  cornerTR: { top: 12, right: 12, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 6 },
  cornerBL: { bottom: 36, left: 12, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 36, right: 12, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 6 },

  qrWrap: { alignItems: 'center', justifyContent: 'center' },
  qrLogo: {
    position: 'absolute',
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  qrLogoText: { fontSize: 20 },

  qrBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 12,
  },
  qrDot: { width: 6, height: 6, borderRadius: 3 },
  qrBadgeText: { fontSize: 12, fontWeight: '600' },

  addressCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: 14, alignSelf: 'stretch', marginBottom: 16,
  },
  addressLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600' },
  addressText: { fontSize: 12, color: Colors.textSecondary, fontFamily: 'monospace', lineHeight: 18 },

  btnRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  actionBtn: {
    flex: 2, height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnCopied: { backgroundColor: Colors.purple },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: Colors.bg },
  actionBtnSecondary: {
    flex: 1, height: 52, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnSecText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },

  connectHint: {
    marginTop: 16, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  connectHintText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});