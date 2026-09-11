import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';

export const AcademicScreen: React.FC = () => {
  const [score, setScore] = useState('');
  const [gpaResult, setGpaResult] = useState<number | null>(null);

  const calculateGPA = () => {
    const val = parseFloat(score);
    if (isNaN(val) || val < 0 || val > 100) {
      Alert.alert('Invalid Score', 'Please enter a valid percentage score between 0 and 100.');
      return;
    }
    let gpa = 5.0;
    if (val >= 70) gpa = 5.0;
    else if (val >= 60) gpa = 4.0;
    else if (val >= 50) gpa = 3.0;
    else if (val >= 45) gpa = 2.0;
    else gpa = 0.0;

    setGpaResult(gpa);
  };

  const resources = [
    { id: '1', title: 'CSC 301 - Data Structures & Algorithms', code: 'CSC301', year: '2025' },
    { id: '2', title: 'MTH 201 - Linear Algebra Final Exam', code: 'MTH201', year: '2024' },
    { id: '3', title: 'PHY 101 - General Physics Study Notes', code: 'PHY101', year: '2025' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gpaCard}>
        <Text style={styles.cardTitle}>📊 Instant GPA Calculator</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Course Score (%)"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            value={score}
            onChangeText={setScore}
          />
          <TouchableOpacity style={styles.calcBtn} onPress={calculateGPA}>
            <Text style={styles.calcBtnText}>Calculate</Text>
          </TouchableOpacity>
        </View>

        {gpaResult !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Estimated Credit Point GPA:</Text>
            <Text style={styles.resultValue}>{gpaResult.toFixed(2)} / 5.00</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>📚 Exam Past Questions Repository</Text>
      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.resCard}>
            <View style={styles.resInfo}>
              <Text style={styles.resTitle}>{item.title}</Text>
              <Text style={styles.resSubtitle}>{item.code} • {item.year}</Text>
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => Alert.alert('Download', 'Downloading past question PDF...')}>
              <Text style={styles.downloadText}>📥 PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 16 },
  gpaCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#F8FAFC', marginBottom: 12 },
  row: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: '#0F172A', borderRadius: 14, paddingHorizontal: 14, color: '#F8FAFC', fontSize: 13, marginRight: 8 },
  calcBtn: { backgroundColor: '#FFFC00', borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' },
  calcBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },
  resultBox: { marginTop: 14, backgroundColor: '#0F172A', padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { color: '#94A3B8', fontSize: 12 },
  resultValue: { color: '#FFFC00', fontSize: 16, fontWeight: '900' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#F8FAFC', marginBottom: 12 },
  list: { paddingBottom: 20 },
  resCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  resInfo: { flex: 1 },
  resTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  resSubtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },
  downloadBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  downloadText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
});
