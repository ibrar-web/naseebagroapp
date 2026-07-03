import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

type Stat = { key: string; label: string; value: string };

type Props = {
  imageUri: string;
  code?: string;
  title?: string;
  badge?: string | null;
  stats?: Stat[];
};

export const OfferPreviewCard = ({ imageUri, code, title, badge, stats }: Props) => (
  <View style={styles.card}>
    <ImageBackground source={{ uri: imageUri }} style={styles.image} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.bottom}>
        {code ? <Text style={styles.code}>{code}</Text> : null}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{title ?? 'Listing'}</Text>
          {badge ? (
            <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
          ) : null}
        </View>
      </View>
    </ImageBackground>
    {stats?.length ? (
      <View style={styles.statsBar}>
        {stats.map((s, i) => (
          <View key={s.key} style={[styles.statItem, i > 0 && styles.statBorder]}>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
          </View>
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  image: { height: 96 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.54)' },
  bottom: { position: 'absolute', bottom: 10, left: 14, right: 14, zIndex: 2 },
  code: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', marginBottom: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
  badge: { backgroundColor: '#F3CD03', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#0D3B1F' },
  statsBar: { backgroundColor: '#145228', paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row' },
  statItem: { flex: 1 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)', paddingLeft: 12 },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: '800', marginBottom: 1 },
  statValue: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
});
