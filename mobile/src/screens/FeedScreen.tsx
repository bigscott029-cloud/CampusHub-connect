import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../supabase';

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  category?: string;
  likes_count?: number;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

export const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: '🔥 All Gists' },
    { id: 'general', label: '💬 Campus Life' },
    { id: 'academic', label: '📚 Academic' },
    { id: 'events', label: '🎉 Events' },
  ];

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('is_anonymous', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPosts(data as Post[]);
      }
    } catch (err) {
      console.log('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isLiked = likedIds[id];
          return { ...p, likes_count: (p.likes_count || 0) + (isLiked ? -1 : 1) };
        }
        return p;
      })
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const isLiked = likedIds[item.id];
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>
              {item.profiles?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.profiles?.full_name || 'Campus Student'}</Text>
            <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.media_url && (
          <Image source={{ uri: item.media_url }} style={styles.postImage} resizeMode="cover" />
        )}

        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
            <Text style={[styles.actionBtnText, isLiked && styles.likedText]}>
              ❤️ {item.likes_count || 0} Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>💬 Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Pills Header */}
      <View style={styles.categoriesHeader}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === cat.id && styles.categoryPillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFFC00" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPosts();
              }}
              tintColor="#FFFC00"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  categoriesHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#FFFC00',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  categoryPillTextActive: {
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  postDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  categoryBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  postContent: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 12,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  likedText: {
    color: '#F43F5E',
    fontWeight: '800',
  },
});
