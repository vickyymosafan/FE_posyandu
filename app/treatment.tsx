import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function TreatmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;

  const treatmentOptions = [
    {
      title: '💊 Buat Resep Digital',
      description: 'Buat resep obat untuk pasien',
      onPress: () => {
        router.push({
          pathname: '/prescription-form',
          params: { patientId },
        });
      },
    },
    {
      title: '🏥 Buat Surat Rujukan',
      description: 'Rujuk pasien ke fasilitas kesehatan lain',
      onPress: () => {
        router.push({
          pathname: '/referral-form',
          params: { patientId },
        });
      },
    },
    {
      title: '📋 Riwayat Resep',
      description: 'Lihat riwayat resep pasien',
      onPress: () => {
        router.push({
          pathname: '/prescription-history',
          params: { patientId },
        });
      },
    },
    {
      title: '📄 Riwayat Rujukan',
      description: 'Lihat riwayat rujukan pasien',
      onPress: () => {
        router.push({
          pathname: '/referral-history',
          params: { patientId },
        });
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Resep & Rujukan</Text>
        <Text style={styles.subtitle}>Pilih jenis layanan</Text>
      </View>

      {/* Treatment Options */}
      <View style={styles.optionsContainer}>
        {treatmentOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionCard}
            onPress={option.onPress}
          >
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Informasi</Text>
        <Text style={styles.infoText}>
          • Resep digital dapat dicetak atau dibagikan{'\n'}
          • Surat rujukan akan mencantumkan hasil pemeriksaan{'\n'}
          • Semua dokumen tersimpan dalam riwayat pasien{'\n'}
          • Pastikan data pemeriksaan sudah lengkap sebelum membuat resep
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.tint,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  optionsContainer: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
});
