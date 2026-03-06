import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';

// SVG Icons
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
      fill={color} />
  </Svg>
);

const SearchIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2.2" />
    <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const QRIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="2" />
    <Path d="M14 14h2v2h-2zM18 14h3v2h-1v1h-2zM14 18h2v3h-2zM18 19h1v1h1v1h-2z" fill="white" />
  </Svg>
);

const AlertIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C10.3 2 9 3.3 9 5V5.3C6.6 6.2 5 8.5 5 11V17L3 19V20H21V19L19 17V11C19 8.5 17.4 6.2 15 5.3V5C15 3.3 13.7 2 12 2Z"
      fill={color} />
    <Path d="M12 23C13.1 23 14 22.1 14 21H10C10 22.1 10.9 23 12 23Z" fill={color} />
  </Svg>
);

const HistoryIcon = ({ color }: { color: string }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 7V12L15 15" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

function TabBarButton({ children, onPress, active }: any) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.88, {}, () => {
      scale.value = withSpring(1);
    });
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.tabBtn}
    >
      <Animated.View style={[styles.tabBtnInner, animStyle]}>
        {children}
      </Animated.View>
      {active && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

function QRTabButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    const interval = setInterval(() => {
      glow.value = withTiming(1, { duration: 800 }, () => {
        glow.value = withTiming(0.6, { duration: 800 });
      });
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.05 }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.qrButtonWrap}>
      <Animated.View style={[styles.qrGlow, glowStyle]} />
      <View style={styles.qrButton}>
        <QRIcon />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#12121E',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButton: (props) => (
            <TabBarButton {...props} active={props.accessibilityState?.selected}>
              <HomeIcon color={props.accessibilityState?.selected ? Colors.green : 'rgba(255,255,255,0.35)'} />
            </TabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          tabBarButton: (props) => (
            <TabBarButton {...props} active={props.accessibilityState?.selected}>
              <SearchIcon color={props.accessibilityState?.selected ? Colors.green : 'rgba(255,255,255,0.35)'} />
            </TabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: '',
          tabBarButton: () => (
            <QRTabButton onPress={() => router.push('/(tabs)/scan')} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <AlertIcon color={color} />,
          tabBarButton: (props) => (
            <TabBarButton {...props} active={props.accessibilityState?.selected}>
              <AlertIcon color={props.accessibilityState?.selected ? Colors.green : 'rgba(255,255,255,0.35)'} />
            </TabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <HistoryIcon color={color} />,
          tabBarButton: (props) => (
            <TabBarButton {...props} active={props.accessibilityState?.selected}>
              <HistoryIcon color={props.accessibilityState?.selected ? Colors.green : 'rgba(255,255,255,0.35)'} />
            </TabBarButton>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  tabBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.green,
    marginTop: 3,
  },
  qrButtonWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  qrGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.green,
    opacity: 0.2,
  },
  qrButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A12',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});