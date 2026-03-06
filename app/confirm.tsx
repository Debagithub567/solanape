import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  Linking, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, withDelay, interpolate,
  Extrapolation, runOnJS, FadeIn,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius } from '../constants/theme';
import { getTxExplorerUrl, shortenAddress } from '../utils/solana';

const { width: SW, height: SH } = Dimensions.get('window');
const PARTICLE_COUNT = 22;

// ── Particle ───────────────────────────────────────────
function Particle({ color, delay, angle, distance }: {
  color: string; delay: number; angle: number; distance: number;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    x.value = withDelay(delay, withSpring(tx, { damping: 8, stiffness: 60 }));
    y.value = withDelay(delay, withSpring(ty, { damping: 8, stiffness: 60 }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600 })
    ));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.2, { damping: 6 }),
      withTiming(0, { duration: 400 })
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, { backgroundColor: color }, style]} />
  );
}

// ── Check / X / Spinner Icon ───────────────────────────
function StatusIcon({ status }: { status: 'confirmed' | 'failed' | 'pending' }) {
  const ringScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const spinVal = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    ringScale.value = withSpring(1, { damping: 12, stiffness: 80 });
    iconScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 120 }));
    if (status === 'pending') {
      spinVal.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    }
    if (status === 'confirmed') {
      pulse.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1, true
      );
    }
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinVal.value}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const color = status === 'confirmed' ? Colors.green : status === 'failed' ? Colors.error : Colors.warning;

  return (
    <Animated.View style={[styles.iconWrap, pulseStyle]}>
      {/* Outer ring */}
      <Animated.View style={[styles.iconRing, { borderColor: color }, ringStyle]} />
      {/* Glow */}
      <View style={[styles.iconGlow, { backgroundColor: color }]} />
      {/* Inner bg */}
      <View style={[styles.iconBg, { backgroundColor: `${color}18` }]}>
        <Animated.View style={iconStyle}>
          {status === 'confirmed' && (
            <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <Path
                d="M10 22L18 30L34 14"
                stroke={Colors.green}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          {status === 'failed' && (
            <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <Path d="M14 14L30 30" stroke={Colors.error} strokeWidth="3.5" strokeLinecap="round" />
              <Path d="M30 14L14 30" stroke={Colors.error} strokeWidth="3.5" strokeLinecap="round" />
            </Svg>
          )}
          {status === 'pending' && (
            <Animated.View style={spinStyle}>
              <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <Circle cx="22" cy="22" r="14" stroke={Colors.warning} strokeWidth="3"
                  strokeDasharray="22 66" strokeLinecap="round" />
              </Svg>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    status: string; amount: string; token: string;
    toAddress: string; toAddressFull: string;
    txSignature: string; label: string;
  }>();

  const status = (params.status || 'confirmed') as 'confirmed' | 'failed' | 'pending';
  const token = params.token || 'SOL';
  const amount = params.amount || '0';

  const [copied, setCopied] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const cardY = useSharedValue(60);
  const cardOpacity = useSharedValue(0);
  const detailsY = useSharedValue(30);
  const detailsOpacity = useSharedValue(0);

  useEffect(() => {
    cardY.value = withSpring(0, { damping: 14, stiffness: 80 });
    cardOpacity.value = withTiming(1, { duration: 400 });
    detailsY.value = withDelay(300, withSpring(0, { damping: 14 }));
    detailsOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    if (status !== 'pending') {
      setTimeout(() => setShowParticles(true), 400);
    }
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardY.value }],
    opacity: cardOpacity.value,
  }));

  const detailsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: detailsY.value }],
    opacity: detailsOpacity.value,
  }));

  const statusColor = status === 'confirmed' ? Colors.green : status === 'failed' ? Colors.error : Colors.warning;
  const statusLabel = status === 'confirmed' ? 'Payment Sent!' : status === 'failed' ? 'Payment Failed' : 'Processing...';
  const statusSub = status === 'confirmed'
    ? `${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
    : status === 'failed'
    ? 'Transaction rejected. Please retry.'
    : 'Confirming on Solana network…';

  const usdValue = token === 'SOL' ? (parseFloat(amount) * 148.23).toFixed(2) : null;

  const particleColors = status === 'confirmed'
    ? [Colors.green, '#00C2FF', '#fff', Colors.purple]
    : status === 'failed'
    ? [Colors.error, '#FF8A65']
    : [Colors.warning, '#FFA500'];

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    color: particleColors[i % particleColors.length],
    delay: i * 30,
    angle: (i / PARTICLE_COUNT) * Math.PI * 2,
    distance: 60 + Math.random() * 80,
  }));

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplorer = () => {
    if (params.txSignature) {
      Linking.openURL(getTxExplorerUrl(params.txSignature));
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Background glow */}
        <View style={[styles.bgGlow, { backgroundColor: statusColor }]} />
        <View style={styles.bgGrid} />

        {/* Particles */}
        {showParticles && (
          <View style={styles.particleWrap}>
            {particles.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </View>
        )}

        <View style={styles.content}>
          {/* Icon */}
          <Animated.View style={cardStyle}>
            <View style={styles.iconCenter}>
              <StatusIcon status={status} />
            </View>

            {/* Status text */}
            <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
            <Text style={styles.statusSub}>{statusSub}</Text>

            {/* Amount */}
            <View style={[styles.amountCard, { borderColor: `${statusColor}30` }]}>
              <Text style={styles.amountMain}>
                {amount}
                <Text style={[styles.amountSym, { color: token === 'SKR' ? Colors.skrGold : Colors.green }]}>
                  {' '}{token}
                </Text>
              </Text>
              {usdValue && <Text style={styles.amountUsd}>≈ ${usdValue} USD</Text>}
            </View>
          </Animated.View>

          {/* Details */}
          <Animated.View style={[styles.details, detailsStyle]}>
            <DetailRow label="To" value={params.label || params.toAddress || 'Unknown'} />
            <DetailRow label="Address" value={params.toAddress || '—'} copyValue={params.toAddressFull} onCopy={handleCopy} />
            <DetailRow label="Network Fee" value="0.000005 SOL" />
            <DetailRow label="Network" value="Devnet" badge badgeColor={Colors.purple} />
            <DetailRow
              label="Status"
              value={status === 'confirmed' ? 'Confirmed' : status === 'failed' ? 'Failed' : 'Pending'}
              badge
              badgeColor={statusColor}
            />
            {params.txSignature && status === 'confirmed' && (
              <DetailRow
                label="Tx ID"
                value={shortenAddress(params.txSignature, 6)}
                copyValue={params.txSignature}
                onCopy={handleCopy}
              />
            )}
          </Animated.View>

          {/* Copy toast */}
          {copied && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.toast}>
              <Text style={styles.toastText}>✓ Copied!</Text>
            </Animated.View>
          )}

          {/* Action buttons */}
          <Animated.View style={[styles.btnRow, detailsStyle]}>
            {status === 'confirmed' && (
              <TouchableOpacity style={styles.btnSecondary} onPress={handleExplorer} activeOpacity={0.8}>
                <Text style={styles.btnSecondaryText}>Explorer ↗</Text>
              </TouchableOpacity>
            )}
            {status === 'failed' && (
              <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()} activeOpacity={0.8}>
                <Text style={styles.btnSecondaryText}>Retry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: statusColor }]}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>
                {status === 'confirmed' ? 'Done' : status === 'failed' ? 'Go Home' : 'Track'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.brand}>Powered by <Text style={{ color: Colors.green }}>Solanape</Text> · Solana</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ label, value, copyValue, onCopy, badge, badgeColor }: {
  label: string; value: string; copyValue?: string;
  onCopy?: (v: string) => void; badge?: boolean; badgeColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailRight}>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}35` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{value}</Text>
          </View>
        ) : (
          <Text style={styles.detailValue}>{value}</Text>
        )}
        {copyValue && onCopy && (
          <TouchableOpacity onPress={() => onCopy(copyValue)} style={styles.copyBtn}>
            <Text style={styles.copyIcon}>⧉</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },

  bgGlow: {
    position: 'absolute', width: 400, height: 400,
    borderRadius: 200, opacity: 0.05,
    top: -100, alignSelf: 'center',
  },
  bgGrid: {
    position: 'absolute', inset: 0,
    // grid lines via background color overlay
    opacity: 0.3,
  },

  particleWrap: {
    position: 'absolute', top: SH * 0.28,
    alignSelf: 'center', width: 0, height: 0, zIndex: 10,
  },
  particle: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },

  content: { flex: 1, paddingHorizontal: Spacing.screen, justifyContent: 'center' },

  iconCenter: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { position: 'relative', width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  iconRing: {
    position: 'absolute', inset: 0,
    borderRadius: 50, borderWidth: 2,
  },
  iconGlow: {
    position: 'absolute', width: 120, height: 120,
    borderRadius: 60, opacity: 0.08,
  },
  iconBg: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },

  statusLabel: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5 },
  statusSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },

  amountCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.xl, borderWidth: 1,
    padding: 20, alignItems: 'center', marginBottom: 24,
  },
  amountMain: { fontSize: 44, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -1.5 },
  amountSym: { fontSize: 22, fontWeight: '600' },
  amountUsd: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  details: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, borderWidth: 1,
    borderColor: Colors.border, marginBottom: 20,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  detailLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: '500' },
  detailRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  detailValue: { fontSize: 13, color: Colors.textSecondary, fontFamily: 'monospace', textAlign: 'right' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  copyBtn: { padding: 4 },
  copyIcon: { fontSize: 15, color: Colors.textMuted },

  toast: {
    position: 'absolute', top: 20, alignSelf: 'center',
    backgroundColor: Colors.green, borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  toastText: { color: Colors.bg, fontWeight: '700', fontSize: 13 },

  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  btnSecondary: {
    flex: 1, height: 54, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  btnPrimary: {
    flex: 2, height: 54, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: Colors.bg },

  brand: { textAlign: 'center', fontSize: 12, color: Colors.textMuted },
});