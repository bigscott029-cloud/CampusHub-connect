import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';

interface Thread {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export const MessagesScreen: React.FC = () => {
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey! Are you still offering the hostel space?', time: '10:14 AM', sender: 'other' },
    { id: '2', text: 'Yes, it is available for inspection tomorrow!', time: '10:15 AM', sender: 'me' },
  ]);
  const [inputText, setInputText] = useState('');

  const sampleThreads: Thread[] = [
    { id: '1', name: 'Campus Study Group 📚', lastMessage: 'Alex: CSC301 exam revision starts at 4 PM.', time: '10:42 AM', unread: 2 },
    { id: '2', name: 'Hostel Landlord 🏠', lastMessage: 'Rent receipt generated for room 2B.', time: 'Yesterday', unread: 0 },
    { id: '3', name: 'Market Buyer (MacBook M1)', lastMessage: 'Can we meet at Student Union Center?', time: '2 days ago', unread: 1 },
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: inputText.trim(), time: 'Just now', sender: 'me' },
    ]);
    setInputText('');
  };

  if (activeThread) {
    return (
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setActiveThread(null)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{activeThread.name}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.msgBubble,
                item.sender === 'me' ? styles.myMsgBubble : styles.otherMsgBubble,
              ]}
            >
              <Text style={[styles.msgText, item.sender === 'me' && styles.myMsgText]}>
                {item.text}
              </Text>
              <Text style={styles.msgTime}>{item.time}</Text>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sampleThreads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.threadsList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.threadCard} onPress={() => setActiveThread(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.threadInfo}>
              <View style={styles.threadRow}>
                <Text style={styles.threadName}>{item.name}</Text>
                <Text style={styles.threadTime}>{item.time}</Text>
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  threadsList: { padding: 16 },
  threadCard: { flexDirection: 'row', backgroundColor: '#1E293B', padding: 14, borderRadius: 18, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFC00', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#0F172A', fontWeight: '900', fontSize: 16 },
  threadInfo: { flex: 1 },
  threadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  threadName: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  threadTime: { fontSize: 10, color: '#64748B' },
  lastMsg: { fontSize: 12, color: '#94A3B8' },
  unreadBadge: { backgroundColor: '#FFFC00', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  unreadText: { color: '#0F172A', fontSize: 10, fontWeight: '900' },
  chatContainer: { flex: 1, backgroundColor: '#0B0F19' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  backBtn: { paddingRight: 12 },
  backBtnText: { color: '#FFFC00', fontWeight: '800', fontSize: 14 },
  chatTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 15 },
  messagesList: { padding: 16 },
  msgBubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  myMsgBubble: { backgroundColor: '#FFFC00', alignSelf: 'flex-end' },
  otherMsgBubble: { backgroundColor: '#1E293B', alignSelf: 'flex-start' },
  msgText: { color: '#F8FAFC', fontSize: 13, lineHeight: 18 },
  myMsgText: { color: '#0F172A', fontWeight: '600' },
  msgTime: { fontSize: 9, color: '#64748B', marginTop: 4, textAlign: 'right' },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  chatInput: { flex: 1, backgroundColor: '#1E293B', borderRadius: 14, paddingHorizontal: 14, color: '#F8FAFC', fontSize: 13 },
  sendBtn: { backgroundColor: '#FFFC00', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center', marginLeft: 8 },
  sendBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },
});
