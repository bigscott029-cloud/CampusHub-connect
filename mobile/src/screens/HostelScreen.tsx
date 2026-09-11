import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Linking, TextInput } from 'react-native';
import { supabase } from '../supabase';

interface HostelListing {
  id: string;
  title: string;
  description: string;
  price_per_year: number;
  location?: string;
  images?: string[];
}

export const HostelScreen: React.FC = () => {
  const [listings, setListings] = useState<HostelListing[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHostels = async () => {
    try {
      const { data, error } = await supabase
        .from('hostel_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setListings(data as HostelListing[]);
    } catch (err) {
      console.log('Error fetching hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
  );

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/2347074474275');
  };

  const renderItem = ({ item }: { item: HostelListing }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0]
              : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop',
        }}
        style={styles.image}
      />
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>₦{item.price_per_year?.toLocaleString()} / yr</Text>
        </View>
        <Text style={styles.location}>📍 {item.location || 'Campus Vicinity'}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <TouchableOpacity style={styles.contactBtn} onPress={openWhatsApp}>
          <Text style={styles.contactBtnText}>📞 Contact Landlord on WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hostels by price, area..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  searchBox: { padding: 16, backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  searchInput: { backgroundColor: '#1E293B', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, color: '#F8FAFC', fontSize: 14 },
  listContent: { padding: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  image: { width: '100%', height: 180 },
  cardBody: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', flex: 1 },
  price: { fontSize: 13, fontWeight: '800', color: '#34D399', backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  location: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  description: { fontSize: 12, color: '#CBD5E1', marginBottom: 12 },
  contactBtn: { backgroundColor: '#059669', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  contactBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
});
