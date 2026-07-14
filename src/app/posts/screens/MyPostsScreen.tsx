import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppIcon } from '../../../assets/icons';
import { useAppSelector } from '../../../store';
import MockStatusBar from '../../components/MockStatusBar';
import BuyerPostsTab from '../components/BuyerPostsTab';
import SellerPostsTab from '../components/SellerPostsTab';
import { showAuthRequiredSheet } from '../../auth/utils/authRequiredSheet';
import { requireCompleteProfile } from '../../auth/utils/profileGate';

const MyPostsScreen = ({ navigation, route }: any) => {
  const mode = useAppSelector(s => s.app.mode);
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const user = useAppSelector(s => s.auth.user);
  const isBuyer = mode === 'buyer';
  const initialTab = route?.params?.initialTab;

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        showAuthRequiredSheet({ redirectToMarket: true });
      }
    }, [isAuthenticated]),
  );

  return (
    <View style={styles.screen}>
      <MockStatusBar backgroundColor="#145228" textColor="#FFFFFF" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Posts</Text>
          <Text style={styles.headerSub}>
            {isBuyer ? 'Your demands and offers' : 'Your supplies and offers'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (!requireCompleteProfile(user, navigation)) return;
            navigation.navigate('PrePost');
          }}
          style={styles.newButton}
          activeOpacity={0.82}
        >
          <AppIcon name="tabPost" size={16} color="#0D3B1F" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {isAuthenticated && (
        isBuyer ? (
          <BuyerPostsTab navigation={navigation} initialTab={initialTab} />
        ) : (
          <SellerPostsTab navigation={navigation} initialTab={initialTab} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#145228',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.53)', marginTop: 2 },
  newButton: {
    backgroundColor: '#F3CD03',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newButtonText: { fontSize: 12, fontWeight: '700', color: '#0D3B1F' },
});

export default MyPostsScreen;
