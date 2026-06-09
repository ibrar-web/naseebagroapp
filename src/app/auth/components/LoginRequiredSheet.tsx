import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppIcon } from '../../../assets/icons';
import iconRegistry from '../../../assets/icons/iconRegistry';

type LoginRequiredSheetProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
};

const LoginRequiredSheet = ({
  visible,
  onClose,
  onLogin,
}: LoginRequiredSheetProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Image source={iconRegistry.naseeb} style={styles.logo} />
        <Text style={styles.title}>Login Required</Text>
        <Text style={styles.message}>
          Please log in to continue this action and access your private
          marketplace data.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.86}
          onPress={onLogin}
        >
          <AppIcon name="profileAvatar" size={17} color="#0D3B1F" />
          <Text style={styles.primaryText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.84}
          onPress={onClose}
        >
          <Text style={styles.secondaryText}>Continue Browsing</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 34,
    alignItems: 'center',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginBottom: 22,
  },
  logo: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  title: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#F3CD03',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryText: {
    color: '#0D3B1F',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LoginRequiredSheet;
