import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Linking, TextInput } from 'react-native';
import { supabase } from '../supabase';

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  images?: string[];
}

export const MarketplaceScreen: React.FC = () => {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchItems = async () => {
    try {
      let query = supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false });
      if (category !== 'all') query = query.eq('category', category);
      const { data, error } = await query;
      if (!error && data) setItems(data as MarketItem[]);
    } catch (err) {
      console.log('Error fetching market items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/2347074474275');
  };

  const renderItem = ({ item }: { item: MarketItem }) => (
    <View style={styles.gridCard}>
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0]
              : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop',
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>₦{item.price?.toLocaleString()}</Text>
        <TouchableOpacity style={styles.chatBtn} onPress={openWhatsApp}>
          <Text style={styles.chatBtnText}>Chat Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search laptops, textbooks..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  headerBox: { padding: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  searchInput: { backgroundColor: '#1E293B', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: '#F8FAFC', fontSize: 14 },
  listContent: { padding: 12 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  gridCard: { backgroundColor: '#1E293B', borderRadius: 16, width: '48%', overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  cardImage: { width: '100%', height: 130 },
  cardContent: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '900', color: '#FFFC00', marginBottom: 8 },
  chatBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  chatBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
