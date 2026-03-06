import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, FadeIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { isValidSolanaAddress } from '../../utils/solana';

const { width: SW, height: SH } = Dimensions.get('window');
const SCANNER_SIZE = SW - 80;

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const scanLine = useSharedValue(0);
  const cornerPulse = useSharedValue(1);

  useEffect(() => {
    // Scan line animation
    scanLine.value = withRepeat(
      withSequence(
        withTiming(SCANNER_SIZE - 4, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1, false
    );
    // Corner pulse
    cornerPulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1, true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLine.value }],
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cornerPulse.value }],
  }));

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate(80);

    // Parse solana: URI or raw address
    let address = data;
    if (data.startsWith('solana:')) {
      address = data.replace('solana:', '').split('?')[0];
    }

    if (isValidSolanaAddress(address)) {
      setTimeout(() => {
        router.push({ pathname: '/send', params: { prefillAddress: address } });
      }, 300);
    } else {
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <SafeAreaView>
          <Text style={styles.permTitle}>Camera Access Needed</Text>
          <Text style={styles.permSub}>Solanape needs camera access to scan QR codes for payments</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Dark overlay */}
      <View style={styles.overlay}>
        {/* Top */}
        <View style={[styles.overlaySection, { flex: 1 }]} />
        {/* Middle row */}
        <View style={styles.middleRow}>
          <View style={styles.overlaySection} />
          {/* Scanner window */}
          <View style={styles.scanWindow}>
            <Animated.View style={[StyleSheet.absoluteFillObject, cornerStyle]}>
              {/* Corners */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </Animated.View>
            {/* Scan line */}
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
          </View>
          <View style={styles.overlaySection} />
        </View>
        {/* Bottom */}
        <View style={[styles.overlaySection, { flex: 1 }]} />
      </View>

      {/* UI overlay */}
      <SafeAreaView style={styles.uiOverlay} edges={['top', 'bottom']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity onPress={() => setFlashOn(!flashOn)} style={styles.flashBtn}>
            <Text style={{ fontSize: 20 }}>{flashOn ? '🔦' : '💡'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Center hint */}
        <View style={styles.hintWrap}>
          <Text style={styles.hintText}>
            {scanned ? '✓ QR Detected! Redirecting...' : 'Align the QR code within the frame'}
          </Text>
        </View>

        {/* Bottom info */}
        <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⚡</Text>
            <View>
              <Text style={styles.infoTitle}>Solana Pay Compatible</Text>
              <Text style={styles.infoSub}>Scan any Solana wallet or merchant QR</Text>
            </View>
          </View>
          {scanned && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <Text style={styles.rescanText}>Tap to scan again</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICK = 3;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  overlaySection: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    width: 40,
  },
  middleRow: { flexDirection: 'row', height: SCANNER_SIZE },
  scanWindow: {
    width: SCANNER_SIZE, height: SCANNER_SIZE,
    overflow: 'hidden',
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0, height: 2,
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: Colors.green, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: Colors.green, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: Colors.green, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: Colors.green, borderBottomRightRadius: 4 },

  uiOverlay: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  flashBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },

  hintWrap: {
    alignItems: 'center',
    marginTop: (SH - SCANNER_SIZE) / 2 - 80,
  },
  hintText: {
    color: '#fff', fontSize: 14, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full,
    overflow: 'hidden',
  },

  bottomInfo: {
    position: 'absolute', bottom: 40, left: Spacing.screen, right: Spacing.screen,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(10,10,18,0.85)',
    borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, borderColor: Colors.greenBorder,
    marginBottom: 12,
  },
  infoEmoji: { fontSize: 24 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  infoSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  rescanBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full,
    paddingVertical: 12, alignItems: 'center',
  },
  rescanText: { fontSize: 15, fontWeight: '700', color: Colors.bg },

  permTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  permSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 24 },
  permBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full,
    paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  permBtnText: { fontSize: 16, fontWeight: '700', color: Colors.bg },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { fontSize: 15, color: 'rgba(255,255,255,0.5)' },
});