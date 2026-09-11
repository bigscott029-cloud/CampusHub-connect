import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';

interface AnonPost {
  id: string;
  content: string;
  created_at: string;
  likes_count?: number;
}

export const AnonymousScreen: React.FC = () => {
  const [anonPosts, setAnonPosts] = useState<AnonPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const fetchAnonPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setAnonPosts(data as AnonPost[]);
      }
    } catch (err) {
      console.log('Error fetching anon posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnonPosts();
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    setAnonPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = likedIds[id];
          return { ...p, likes_count: (p.likes_count || 0) + (isLiked ? -1 : 1) };
        }
        return p;
      })
    );
  };

  const renderItem = ({ item, index }: { item: AnonPost; index: number }) => {
    const isLiked = likedIds[item.id];
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.ghostTitle}>👻 Ghost Secret #{item.id.slice(0, 4)}</Text>
          <Text style={styles.encryptedText}>🔒 Encrypted</Text>
        </View>
        <Text style={styles.content}>"{item.content}"</Text>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
            <Text style={[styles.likeBtn, isLiked && styles.likedBtn]}>
              💜 {item.likes_count || 0} Reacts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.replyBtn}>💬 Reply Anon</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>👻 Anonymous Zone</Text>
        <Text style={styles.bannerSubtitle}>100% Identity Concealed • Safe Confessions</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={anonPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  banner: {
    backgroundColor: '#1E1B4B',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#312E81',
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: '#C084FC' },
  bannerSubtitle: { fontSize: 11, color: '#A78BFA', marginTop: 2 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ghostTitle: { color: '#C084FC', fontWeight: '800', fontSize: 13 },
  encryptedText: { color: '#A78BFA', fontSize: 10 },
  content: { color: '#F3E8FF', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginBottom: 12 },
  footer: { flexDirection: 'row', justify: 'space-between', borderTopWidth: 1, borderTopColor: '#3730A3', paddingTop: 10, justifyContent: 'space-between' },
  likeBtn: { color: '#A78BFA', fontWeight: '600', fontSize: 12 },
  likedBtn: { color: '#E9D5FF', fontWeight: '800' },
  replyBtn: { color: '#C084FC', fontWeight: '600', fontSize: 12 },
});
