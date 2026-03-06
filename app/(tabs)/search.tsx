import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../../src/stores/wallet-store';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { shortenAddress, isValidSolanaAddress } from '../../utils/solana';

function ContactRow({ contact, index }: { contact: any; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1); });
    Keyboard.dismiss();
    setTimeout(() => {
      router.push({ pathname: '/send', params: { prefillAddress: contact.address, prefillName: contact.name } });
    }, 100);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.contactRow}>
        <Animated.View style={animStyle}>
          <View style={styles.contactRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{contact.emoji}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactAddress}>{shortenAddress(contact.address, 8)}</Text>
            </View>
            <View style={styles.sendChip}>
              <Text style={styles.sendChipText}>Send →</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const { contacts } = useWalletStore();
  const [query, setQuery] = useState('');
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!query) return contacts;
    const q = query.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  const isAddress = isValidSolanaAddress(query);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.sub}>Find contacts or paste an address</Text>
        </Animated.View>

        {/* Search bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Name or wallet address..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Send to address directly if valid */}
        {isAddress && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.directSend}>
            <Text style={styles.directLabel}>Valid Solana address detected</Text>
            <TouchableOpacity
              style={styles.directBtn}
              onPress={() => router.push({ pathname: '/send', params: { prefillAddress: query } })}
              activeOpacity={0.85}
            >
              <Text style={styles.directBtnText}>Send to this address →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={c => c.id}
          renderItem={({ item, index }) => <ContactRow contact={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No contacts found</Text>
              <Text style={styles.emptySub}>Try a different name or paste a full address</Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 && !query ? (
              <Text style={styles.listHeader}>All Contacts</Text>
            ) : query && filtered.length > 0 ? (
              <Text style={styles.listHeader}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.screen, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 52,
    marginHorizontal: Spacing.screen, marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  clearBtn: { fontSize: 14, color: Colors.textMuted, paddingLeft: 8 },

  directSend: {
    marginHorizontal: Spacing.screen, marginBottom: 16,
    backgroundColor: Colors.greenDim, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.greenBorder,
    padding: 14,
  },
  directLabel: { fontSize: 12, color: Colors.green, marginBottom: 8, fontWeight: '600' },
  directBtn: {
    backgroundColor: Colors.green, borderRadius: Radius.full,
    paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start',
  },
  directBtnText: { fontSize: 14, fontWeight: '700', color: Colors.bg },

  list: { paddingHorizontal: Spacing.screen, paddingBottom: 100 },
  listHeader: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },

  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  contactAddress: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontFamily: 'monospace' },
  sendChip: {
    backgroundColor: Colors.greenDim, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.greenBorder,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  sendChipText: { fontSize: 12, color: Colors.green, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
});