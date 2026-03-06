import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useWalletStore } from '../../src/stores/wallet-store';

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

const FRAME_SIZE = 260;
const OVERLAY_COLOR = 'rgba(0,0,0,0.65)';

export default function Scan() {
  const router = useRouter();

  // ── Read directly from store (NEVER from useWallet hook) ──
  const isConnected = useWalletStore((s) => s.isConnected);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  // ── Reset torch + scanned state on blur ──
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTorch(false);
        setScanned(false);
      };
    }, [])
  );

  // ── Parse Solana QR ──
  const parseQR = (data: string): { address: string; amount?: string } | null => {
    try {
      if (data.startsWith('solana:')) {
        const withoutScheme = data.replace('solana:', '');
        const [addressPart, queryPart] = withoutScheme.split('?');
        const address = addressPart.trim();
        let amount: string | undefined;
        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          amount = params.get('amount') ?? undefined;
        }
        if (address.length >= 32 && address.length <= 44) {
          return { address, amount };
        }
      } else if (data.length >= 32 && data.length <= 44) {
        return { address: data };
      }
      return null;
    } catch {
      return null;
    }
  };

  const navigateToSend = (address: string, amount?: string) => {
    setTorch(false);
    const query = amount
      ? `?address=${encodeURIComponent(address)}&amount=${encodeURIComponent(amount)}`
      : `?address=${encodeURIComponent(address)}`;
    router.push((`/send${query}`) as any);
  };

  // ── Connect wallet prompt ──
  const showConnectPrompt = () => {
    Alert.alert(
      '🔗 Connect Wallet First',
      'You need to connect your Phantom wallet before scanning a QR code to send SOL.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect Wallet',
          onPress: () => {
            // connect() lives on useWallet hook only — navigate to Home tab
            // where the user can tap the Connect button.
            router.push('/(tabs)/' as any);
          },
        },
      ]
    );
  };

  // ── Camera scan handler ──
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    if (!isConnected) {
      showConnectPrompt();
      return;
    }

    setScanned(true);
    Vibration.vibrate(100);

    const parsed = parseQR(data);

    if (!parsed) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code does not contain a valid Solana address. Please scan a Solana wallet or payment QR.',
        [{ text: 'Scan Again', onPress: () => setScanned(false) }]
      );
      return;
    }

    navigateToSend(parsed.address, parsed.amount);
    setTimeout(() => setScanned(false), 2000);
  };

  // ── Gallery picker ──
  const handleGalleryPick = async () => {
    if (!isConnected) {
      showConnectPrompt();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      Alert.alert(
        'QR Image Selected',
        'Automatic QR decoding from gallery images is not supported yet. Please enter the wallet address manually or use the camera to scan directly.',
        [
          {
            text: 'Enter Manually',
            onPress: () => {
              setTorch(false);
              router.push('/send' as any);
            },
          },
          { text: 'Use Camera', style: 'cancel' },
        ]
      );
    } catch {
      Alert.alert('Error', 'Could not open gallery. Please try again.');
    }
  };

  // ── Permission loading ──
  if (!permission) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.text}>Checking camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Ionicons name="camera-outline" size={72} color={C.purple} />
          <Text style={s.permTitle}>Camera Access Required</Text>
          <Text style={s.permSub}>
            SolanaPe needs camera access to scan Solana payment QR codes.
          </Text>

          {permission.canAskAgain ? (
            <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
              <Ionicons name="camera-outline" size={18} color="#fff" />
              <Text style={s.permBtnText}>Allow Camera Access</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.permBtn} onPress={() => Linking.openSettings()}>
              <Ionicons name="settings-outline" size={18} color="#fff" />
              <Text style={s.permBtnText}>Open Settings</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.galleryPermBtn} onPress={handleGalleryPick}>
            <Ionicons name="images-outline" size={18} color={C.purple} />
            <Text style={s.galleryPermBtnText}>Pick from Gallery Instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main scan screen ──
  return (
    <View style={s.fullScreen}>

      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* DARK OVERLAY cutout around scan frame */}
      <View style={s.overlayTop} />
      <View style={s.overlayBottom} />
      <View style={s.overlayLeft} />
      <View style={s.overlayRight} />

      <SafeAreaView style={s.overlay}>

        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Scan to Pay</Text>
          <View style={[
            s.connectionBadge,
            { backgroundColor: isConnected ? 'rgba(20,241,149,0.15)' : 'rgba(239,68,68,0.15)' },
          ]}>
            <View style={[
              s.connectionDot,
              { backgroundColor: isConnected ? C.green : C.red },
            ]} />
            <Text style={[
              s.connectionText,
              { color: isConnected ? C.green : C.red },
            ]}>
              {isConnected ? 'Wallet Connected' : 'Not Connected'}
            </Text>
          </View>
        </View>

        {/* SCAN FRAME */}
        <View style={s.scanArea}>
          <View style={s.scanFrame}>
            {/* Corner brackets */}
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />

            {/* Scanned success state */}
            {scanned && (
              <View style={s.scannedOverlay}>
                <Ionicons name="checkmark-circle" size={60} color={C.green} />
                <Text style={s.scannedText}>Address Found!</Text>
                <Text style={s.scannedSubText}>Redirecting to Send...</Text>
              </View>
            )}

            {/* Not connected nudge inside frame */}
            {!isConnected && !scanned && (
              <TouchableOpacity style={s.notConnectedOverlay} onPress={showConnectPrompt}>
                <Ionicons name="wallet-outline" size={36} color={C.red} />
                <Text style={s.notConnectedText}>Tap to Connect Wallet</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.scanHint}>
            {isConnected
              ? 'Point at a Solana wallet or payment QR code'
              : 'Connect your wallet before scanning'}
          </Text>
        </View>

        {/* BOTTOM ACTIONS */}
        <View style={s.bottom}>
          <View style={s.bottomActions}>

            {/* Torch */}
            <TouchableOpacity style={s.bottomActionBtn} onPress={() => setTorch((t) => !t)}>
              <View style={[s.bottomActionIcon, torch && s.bottomActionIconActive]}>
                <Ionicons
                  name={torch ? 'flash' : 'flash-outline'}
                  size={24}
                  color={torch ? '#F59E0B' : '#fff'}
                />
              </View>
              <Text style={[s.bottomActionText, torch && { color: '#F59E0B' }]}>
                {torch ? 'Torch On' : 'Torch'}
              </Text>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity style={s.bottomActionBtn} onPress={handleGalleryPick}>
              <View style={s.bottomActionIcon}>
                <Ionicons name="images-outline" size={24} color="#fff" />
              </View>
              <Text style={s.bottomActionText}>Gallery</Text>
            </TouchableOpacity>

            {/* Manual entry */}
            <TouchableOpacity
              style={s.bottomActionBtn}
              onPress={() => {
                if (!isConnected) { showConnectPrompt(); return; }
                setTorch(false);
                router.push('/send' as any);
              }}
            >
              <View style={s.bottomActionIcon}>
                <Ionicons name="keypad-outline" size={24} color="#fff" />
              </View>
              <Text style={s.bottomActionText}>Manual</Text>
            </TouchableOpacity>

            {/* My QR */}
            <TouchableOpacity
              style={s.bottomActionBtn}
              onPress={() => {
                setTorch(false);
                router.push('/receive' as any);
              }}
            >
              <View style={s.bottomActionIcon}>
                <Ionicons name="qr-code-outline" size={24} color="#fff" />
              </View>
              <Text style={s.bottomActionText}>My QR</Text>
            </TouchableOpacity>

          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },

  // Cutout overlay panels
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlayLeft: {
    position: 'absolute',
    top: '25%',
    left: 0,
    width: '15%',
    height: '45%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlayRight: {
    position: 'absolute',
    top: '25%',
    right: 0,
    width: '15%',
    height: '45%',
    backgroundColor: OVERLAY_COLOR,
  },

  // Permission screen
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
    backgroundColor: C.bg,
  },
  text: {
    color: C.text,
    fontSize: 16,
  },
  permTitle: {
    color: C.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permSub: {
    color: C.sub,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  permBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.purple,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  permBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryPermBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'center',
  },
  galleryPermBtnText: {
    color: C.purple,
    fontSize: 15,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Scan area
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: C.green,
    borderWidth: 3,
  },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  // In-frame overlays
  scannedOverlay: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.82)',
    padding: 24,
    borderRadius: 16,
  },
  scannedText: {
    color: C.green,
    fontSize: 18,
    fontWeight: '700',
  },
  scannedSubText: {
    color: C.sub,
    fontSize: 13,
  },
  notConnectedOverlay: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.78)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  notConnectedText: {
    color: C.red,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Bottom bar
  bottom: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomActionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  bottomActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bottomActionIconActive: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderColor: '#F59E0B',
  },
  bottomActionText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '500',
  },
});