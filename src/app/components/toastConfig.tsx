import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { navigationRef } from '../../navigation/AppNavigator';

type OfferToastProps = BaseToastProps & {
  props?: { offerId?: string };
};

const OfferToast = ({ text1, text2, props }: OfferToastProps) => {
  const handlePress = () => {
    const offerId = props?.offerId;
    if (offerId && navigationRef.isReady()) {
      navigationRef.navigate('Negotiation', { offerId });
    }
  };

  return (
    <TouchableOpacity style={styles.toast} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{text1}</Text>
        {!!text2 && <Text style={styles.body} numberOfLines={1}>{text2}</Text>}
        <Text style={styles.tap}>Tap to open →</Text>
      </View>
    </TouchableOpacity>
  );
};

export const toastConfig: ToastConfig = {
  offer: (props) => <OfferToast {...props} />,
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D3B1F',
    borderRadius: 14,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 18,
    width: '92%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 10,
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800', color: '#FFFFFF', marginBottom: 1 },
  body: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 3 },
  tap: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
});
