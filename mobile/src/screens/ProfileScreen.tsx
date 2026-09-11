import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>

        <Text style={styles.name}>{profile?.full_name || user?.email?.split('@')[0]}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP Points</Text>
            <Text style={styles.statValue}>{profile?.reputation_points || 120}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Rank Level</Text>
            <Text style={styles.statValue}>Level {profile?.level || 2}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out of App</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  profileCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFC00', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  name: { fontSize: 20, fontWeight: '900', color: '#F8FAFC', marginBottom: 2 },
  email: { fontSize: 12, color: '#94A3B8', marginBottom: 18 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', backgroundColor: '#0F172A', padding: 14, borderRadius: 16 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#64748B', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '900', color: '#FFFC00' },
  signOutBtn: { backgroundColor: '#7F1D1D', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  signOutText: { color: '#FCA5A5', fontWeight: '800', fontSize: 14 },
});
