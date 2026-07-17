import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { showAlert } from '../../components/toastConfig';
import { WebView } from 'react-native-webview';

interface Props {
  visible: boolean;
  url: string | null;
  fileName: string;
  onClose: () => void;
}

const isImage = (name: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(name);

const DocumentViewerModal: React.FC<Props> = ({ visible, url, fileName, onClose }) => {
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  if (!url) return null;

  const viewUrl = isImage(fileName)
    ? url
    : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  const handleDownload = () => {
    Linking.openURL(url).catch(() =>
      showAlert('error', 'Error', 'Could not open document.'),
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.75}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.fileName} numberOfLines={1}>
            {fileName}
          </Text>
          <TouchableOpacity style={s.downloadBtn} onPress={handleDownload} activeOpacity={0.8}>
            <Text style={s.downloadBtnText}>↓ Download</Text>
          </TouchableOpacity>
        </View>

        {/* Viewer */}
        <View style={s.viewer}>
          {webError ? (
            <View style={s.errorWrap}>
              <Text style={s.errorText}>Could not load document.</Text>
              <TouchableOpacity style={s.openBrowserBtn} onPress={handleDownload} activeOpacity={0.8}>
                <Text style={s.openBrowserBtnText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <WebView
                source={{ uri: viewUrl }}
                style={s.webview}
                onLoadStart={() => { setWebLoading(true); setWebError(false); }}
                onLoadEnd={() => setWebLoading(false)}
                onError={() => { setWebLoading(false); setWebError(true); }}
                onHttpError={() => { setWebLoading(false); setWebError(true); }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
              />
              {webLoading && (
                <View style={s.loaderOverlay}>
                  <ActivityIndicator size="large" color="#217A3C" />
                  <Text style={s.loaderText}>Loading document…</Text>
                </View>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  closeBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  fileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  downloadBtn: {
    backgroundColor: '#145228',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexShrink: 0,
  },
  downloadBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  viewer: { flex: 1 },
  webview: { flex: 1 },

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loaderText: { fontSize: 13, color: '#6B7280' },

  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  openBrowserBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  openBrowserBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});

export default DocumentViewerModal;
