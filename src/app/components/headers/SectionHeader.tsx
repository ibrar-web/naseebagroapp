import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

const SectionHeader = ({ title, onSeeAll }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>

    {onSeeAll && (
      <TouchableOpacity
        onPress={onSeeAll}
        style={styles.seeAllBtn}
        activeOpacity={0.75}
      >
        <Text style={styles.seeAllText}>See All</Text>
        <Text style={styles.seeAllChevron}>›</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default SectionHeader;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  seeAllText: {
    fontSize: 12,
    color: '#217A3C',
    fontWeight: '600',
  },

  seeAllChevron: {
    fontSize: 14,
    color: '#217A3C',
    fontWeight: '700',
  },
});
