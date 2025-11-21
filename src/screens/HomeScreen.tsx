'use client';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { generateResponse } from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const HomeScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
    }
  }, [isAuthenticated, navigation]);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để tiếp tục');
      Alert.alert('Lỗi xác thực', 'Bạn cần đăng nhập để sử dụng tính năng chat');
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setError(null);
    setLoading(true);

    try {
      // Call Cloud Function through secure proxy
      const response = await generateResponse(
        inputText,
        messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Lỗi gửi tin nhắn:', error);

      // Handle specific error types
      if (error.code === 'functions/unauthenticated') {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        Alert.alert(
          'Phiên hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục sử dụng chat.',
          [
            {
              text: 'Đăng nhập lại',
              onPress: () => {
                handleLogout();
              },
            },
          ]
        );
      } else if (error.code === 'functions/permission-denied') {
        setError('Bạn không có quyền truy cập tính năng này.');
        Alert.alert('Lỗi quyền hạn', 'Bạn không có quyền truy cập tính năng chat.');
      } else if (error.code === 'functions/unavailable') {
        setError('Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.');
        Alert.alert(
          'Dịch vụ không khả dụng',
          'Vui lòng kiểm tra kết nối mạng và thử lại.'
        );
      } else if (error.message && error.message.includes('Network')) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối Internet của bạn.');
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      } else {
        setError('Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.');
        Alert.alert('Lỗi', 'Đã xảy ra lỗi bất ngờ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  // Show loading screen while checking authentication
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang xác thực...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lexi - AI English Tutor</Text>
        {user && <Text style={styles.userEmail}>{user.email}</Text>}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          editable={!loading}
          multiline
        />
        <Button
          title={loading ? 'Đang gửi...' : 'Gửi'}
          onPress={handleSendMessage}
          disabled={loading || !inputText.trim()}
        />
      </View>

      <View style={styles.logoutButton}>
        <Button title="Đăng xuất" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    margin: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#d9534f',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 14,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 12,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
