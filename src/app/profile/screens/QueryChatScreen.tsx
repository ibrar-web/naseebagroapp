import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import iconRegistry from '../../../assets/icons/iconRegistry';
import api from '../../../utils/api';
import { onQueryAdminReply, onQueryClosed } from '../../../utils/sockets/queries';

type Props = NativeStackScreenProps<RootStackParamList, 'QueryChat'>;

interface Message {
  id: string;
  content: string;
  sender_role: 'user' | 'admin';
  created_at: string;
}

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const QueryChatScreen = ({ navigation, route }: Props) => {
  const { queryId } = route.params ?? {};
  const isNew = !queryId;

  const [queryIdState, setQueryIdState] = useState<string | undefined>(queryId);
  const [subject, setSubject] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [queryClosed, setQueryClosed] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Load existing query + messages
  useEffect(() => {
    if (!queryIdState) return;
    (async () => {
      setLoading(true);
      try {
        const data: any = await api.queries.getById(queryIdState);
        setSubject(data.subject ?? '');
        setQueryClosed(data.status === 'CLOSED');
        const msgs: Message[] = (data.messages ?? []).map((m: any) => ({
          id: m.id,
          content: m.content,
          sender_role: m.sender_role,
          created_at: m.created_at,
        }));
        setMessages(msgs);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, [queryIdState]);

  // Scroll to bottom when messages load or change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  // Real-time: admin reply socket
  useEffect(() => {
    if (!queryIdState) return;

    const unsub = onQueryAdminReply((payload) => {
      if (payload.query_id !== queryIdState) return;
      const newMsg: Message = {
        id: payload.message.id,
        content: payload.message.content,
        sender_role: 'admin',
        created_at: payload.message.created_at,
      };
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });

    const unsubClose = onQueryClosed((payload) => {
      if (payload.query_id !== queryIdState) return;
      setQueryClosed(true);
    });

    return () => {
      unsub();
      unsubClose();
    };
  }, [queryIdState]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending || queryClosed) return;

    setSending(true);
    try {
      if (!queryIdState) {
        // New query — subject defaults to first few words
        const sub = text.slice(0, 60);
        const data: any = await api.queries.create({ subject: sub, message: text });
        setQueryIdState(data.id);
        setSubject(data.subject ?? sub);
        const msgs: Message[] = (data.messages ?? []).map((m: any) => ({
          id: m.id,
          content: m.content,
          sender_role: m.sender_role,
          created_at: m.created_at,
        }));
        setMessages(msgs);
      } else {
        const data: any = await api.queries.sendMessage(queryIdState, { content: text });
        const newMsg: Message = {
          id: data.id,
          content: data.content,
          sender_role: 'user',
          created_at: data.created_at,
        };
        setMessages(prev => [...prev, newMsg]);
      }
      setInputText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to send message.';
      Alert.alert('Error', msg);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, queryClosed, queryIdState]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender_role === 'user';
    return (
      <View style={[m.msgRow, isUser ? m.msgRowUser : m.msgRowSupport]}>
        {!isUser && (
          <View style={m.avatar}>
            <Image
              source={iconRegistry.naseeb as any}
              style={m.avatarImg}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={[m.bubble, isUser ? m.bubbleUser : m.bubbleSupport]}>
          <Text style={[m.bubbleText, isUser ? m.bubbleTextUser : m.bubbleTextSupport]}>
            {item.content}
          </Text>
          <Text style={[m.bubbleTime, isUser ? m.bubbleTimeUser : m.bubbleTimeSupport]}>
            {fmtTime(item.created_at)}
          </Text>
        </View>
        {isUser && <View style={m.avatarSpacer} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={m.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <MockStatusBar />

      <View style={m.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={m.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={m.headerTitle} numberOfLines={1}>
          {isNew && !queryIdState ? 'New Query' : subject || 'Query Details'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={m.center}>
          <ActivityIndicator size="large" color="#217A3C" />
        </View>
      ) : (
        <>
          {messages.length === 0 && (
            <View style={m.logoBanner}>
              <Image source={iconRegistry.naseeb as any} style={m.logo} resizeMode="contain" />
              <Text style={m.logoBannerText}>Send a message to start your query.</Text>
            </View>
          )}

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={[m.listContent, messages.length === 0 && { flex: 1 }]}
            showsVerticalScrollIndicator={false}
            renderItem={renderMessage}
            ListHeaderComponent={
              messages.length > 0 ? (
                <View style={m.chatLogoWrap}>
                  <Image source={iconRegistry.naseeb as any} style={m.chatLogo} resizeMode="contain" />
                </View>
              ) : null
            }
          />
        </>
      )}

      {queryClosed ? (
        <View style={m.closedBar}>
          <Text style={m.closedText}>This query has been closed.</Text>
        </View>
      ) : (
        <View style={m.inputBar}>
          <TextInput
            style={m.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[m.sendBtn, (!inputText.trim() || sending) && m.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={m.sendText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },

  logoBanner: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  logo: { width: 100, height: 100 },
  logoBannerText: { fontSize: 13, color: '#9CA3AF' },

  listContent: { padding: 16, paddingBottom: 12, gap: 10 },
  chatLogoWrap: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  chatLogo: { width: 80, height: 80 },

  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowSupport: { justifyContent: 'flex-start' },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2FBF5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: { width: 28, height: 28 },
  avatarSpacer: { width: 32, flexShrink: 0 },

  bubble: { maxWidth: '72%', padding: 12, borderRadius: 16 },
  bubbleUser: { backgroundColor: '#1A6B34', borderBottomRightRadius: 4 },
  bubbleSupport: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextSupport: { color: '#111827' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  bubbleTimeSupport: { color: '#9CA3AF' },

  closedBar: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  closedText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: '#1A6B34',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexShrink: 0,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default QueryChatScreen;
