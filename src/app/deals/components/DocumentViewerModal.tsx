import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { showAlert } from '../../components/toastConfig';

interface Props {
  visible: boolean;
  url: string | null;
  fileName: string;
  onClose: () => void;
}

const isImage = (name: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(name);

const DocumentViewerModal: React.FC<Props> = ({ visible, url, fileName, onClose }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  if (!url) return null;

  const image = isImage(fileName);

  const handleOpenBrowser = () => {
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
          <TouchableOpacity style={s.openBtn} onPress={handleOpenBrowser} activeOpacity={0.8}>
            <Text style={s.openBtnText}>↗ Open</Text>
          </TouchableOpacity>
        </View>

        {/* Viewer */}
        <View style={s.viewer}>
          {image ? (
            /* ── Image viewer ── */
            <ScrollView
              contentContainerStyle={s.imageScroll}
              maximumZoomScale={4}
              minimumZoomScale={1}
            >
              {imgError ? (
                <View style={s.errorWrap}>
                  <Text style={s.errorText}>Could not load image.</Text>
                  <TouchableOpacity style={s.retryBtn} onPress={handleOpenBrowser} activeOpacity={0.8}>
                    <Text style={s.retryBtnText}>Open in Browser</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: url }}
                    style={s.image}
                    resizeMode="contain"
                    onLoadStart={() => { setImgLoading(true); setImgError(false); }}
                    onLoadEnd={() => setImgLoading(false)}
                    onError={() => { setImgLoading(false); setImgError(true); }}
                  />
                  {imgLoading && (
                    <View style={s.loaderOverlay}>
                      <ActivityIndicator size="large" color="#217A3C" />
                      <Text style={s.loaderText}>Loading…</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          ) : (
            /* ── PDF / file viewer — load signed URL directly in WebView ── */
            webError ? (
              <View style={s.errorWrap}>
                <Text style={s.errorIcon}>📄</Text>
                <Text style={s.errorText}>Could not display this file inline.</Text>
                <TouchableOpacity style={s.retryBtn} onPress={handleOpenBrowser} activeOpacity={0.8}>
                  <Text style={s.retryBtnText}>Open in Browser</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <WebView
                  source={{ uri: url }}
                  style={s.webview}
                  onLoadStart={() => { setWebLoading(true); setWebError(false); }}
                  onLoadEnd={() => setWebLoading(false)}
                  onError={() => { setWebLoading(false); setWebError(true); }}
                  onHttpError={() => { setWebLoading(false); setWebError(true); }}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  allowFileAccess
                />
                {webLoading && (
                  <View style={s.loaderOverlay}>
                    <ActivityIndicator size="large" color="#217A3C" />
                    <Text style={s.loaderText}>Loading document…</Text>
                  </View>
                )}
              </>
            )
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
  fileName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827' },
  openBtn: {
    backgroundColor: '#145228',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexShrink: 0,
  },
  openBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  viewer: { flex: 1 },

  // Image
  imageScroll: { flexGrow: 1, justifyContent: 'center' },
  image: { width: '100%', aspectRatio: 1 },

  // WebView (PDF / other)
  webview: { flex: 1 },

  // Shared loader / error
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
    padding: 32,
  },
  errorIcon: { fontSize: 52 },
  errorText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#217A3C',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default DocumentViewerModal;
