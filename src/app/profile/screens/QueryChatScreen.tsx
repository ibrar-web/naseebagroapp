import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { MockStatusBar } from '../../components';
import { AppIcon } from '../../../assets/icons';
import iconRegistry from '../../../assets/icons/iconRegistry';

type Props = NativeStackScreenProps<RootStackParamList, 'QueryChat'>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hello, I have a question about my recent deal.',
    sender: 'user',
    time: '10:30 AM',
  },
  {
    id: '2',
    text: 'Hi! Sure, we are happy to help. Please describe your issue.',
    sender: 'support',
    time: '10:31 AM',
  },
  {
    id: '3',
    text: "I received fewer bags than agreed. The deal was for 200 bags but I only received 180.",
    sender: 'user',
    time: '10:32 AM',
  },
  {
    id: '4',
    text: "We have noted your concern. Our team will verify the delivery records and get back to you within 24 hours.",
    sender: 'support',
    time: '10:33 AM',
  },
];

const QueryChatScreen = ({ navigation, route }: Props) => {
  const { queryId } = route.params ?? {};
  const isNew = !queryId;
  const [messages, setMessages] = useState<Message[]>(
    isNew ? [] : MOCK_MESSAGES,
  );
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, []);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: String(Date.now()),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          m.msgRow,
          isUser ? m.msgRowUser : m.msgRowSupport,
        ]}
      >
        {!isUser && (
          <View style={m.avatar}>
            <Image
              source={iconRegistry.naseeb as any}
              style={m.avatarImg}
              resizeMode="contain"
            />
          </View>
        )}
        <View
          style={[
            m.bubble,
            isUser ? m.bubbleUser : m.bubbleSupport,
          ]}
        >
          <Text style={[m.bubbleText, isUser ? m.bubbleTextUser : m.bubbleTextSupport]}>
            {item.text}
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

      {/* Header */}
      <View style={m.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={m.backBtn}
          activeOpacity={0.7}
        >
          <AppIcon name="back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={m.headerTitle}>
          {isNew ? 'New Query' : 'Query Details'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Logo banner (shown when no messages or new query) */}
      {messages.length === 0 && (
        <View style={m.logoBanner}>
          <Image
            source={iconRegistry.naseeb as any}
            style={m.logo}
            resizeMode="contain"
          />
          <Text style={m.logoBannerText}>
            Send a message to start your query.
          </Text>
        </View>
      )}

      {/* Message list */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          m.listContent,
          messages.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={renderMessage}
        ListHeaderComponent={
          messages.length > 0 ? (
            <View style={m.chatLogoWrap}>
              <Image
                source={iconRegistry.naseeb as any}
                style={m.chatLogo}
                resizeMode="contain"
              />
            </View>
          ) : null
        }
      />

      {/* Input bar */}
      <View style={m.inputBar}>
        <TextInput
          style={m.input}
          placeholder="Text...."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[m.sendBtn, !inputText.trim() && m.sendBtnDisabled]}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={!inputText.trim()}
        >
          <Text style={m.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  logoBanner: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
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

  bubble: {
    maxWidth: '72%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#1A6B34',
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextSupport: { color: '#111827' },

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
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default QueryChatScreen;
