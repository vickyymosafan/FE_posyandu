import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Patient, HealthRecord } from '../types';

export default function PatientProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse patient data and health records from params
  const patientData: Patient = JSON.parse(params.patientData as string);
  const healthRecords: HealthRecord[] = JSON.parse(params.healthRecords as string);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Kurus', color: '#f59e0b' };
    if (bmi < 25) return { category: 'Normal', color: '#10b981' };
    if (bmi < 30) return { category: 'Gemuk', color: '#f59e0b' };
    return { category: 'Obesitas', color: '#ef4444' };
  };

  const getBloodPressureCategory = (systolic: number, diastolic: number): { category: string; color: string } => {
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', color: '#10b981' };
    if (systolic < 130 && diastolic < 80) return { category: 'Tinggi Normal', color: '#f59e0b' };
    if (systolic < 140 || diastolic < 90) return { category: 'Hipertensi Tingkat 1', color: '#f59e0b' };
    return { category: 'Hipertensi Tingkat 2', color: '#ef4444' };
  };

  const startNewExamination = () => {
    Alert.alert(
      'Mulai Pemeriksaan',
      'Pilih jenis pemeriksaan yang akan dilakukan:',
      [
        {
          text: 'Pemeriksaan Fisik',
          onPress: () => {
            router.push({
              pathname: '/physical-exam',
              params: { patientId: patientData.id.toString() },
            });
          },
        },
        {
          text: 'Pemeriksaan Lanjutan',
          onPress: () => {
            router.push({
              pathname: '/advanced-exam',
              params: { patientId: patientData.id.toString() },
            });
          },
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Profil Lansia</Text>
      </View>

      {/* Patient Info Card */}
      <View style={styles.patientCard}>
        <View style={styles.patientHeader}>
          {patientData.photoUrl && (
            <Image
              source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${patientData.photoUrl}` }}
              style={styles.patientPhoto}
            />
          )}
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientData.fullName}</Text>
            <Text style={styles.patientAge}>
              {calculateAge(patientData.dateOfBirth)} tahun
            </Text>
            <Text style={styles.qrCode}>QR: {patientData.qrCode}</Text>
          </View>
        </View>

        <View style={styles.patientDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Lahir:</Text>
            <Text style={styles.detailValue}>
              {formatDate(patientData.dateOfBirth)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alamat:</Text>
            <Text style={styles.detailValue}>{patientData.address}</Text>
          </View>
          
          {patientData.phoneNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Telepon:</Text>
              <Text style={styles.detailValue}>{patientData.phoneNumber}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startNewExamination}
        >
          <Text style={styles.primaryButtonText}>🩺 Mulai Pemeriksaan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            router.push({
              pathname: '/treatment',
              params: { patientId: patientData.id.toString() },
            });
          }}
        >
          <Text style={styles.secondaryButtonText}>💊 Resep & Rujukan</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Health Records */}
      <View style={styles.healthRecordsSection}>
        <Text style={styles.sectionTitle}>Riwayat Pemeriksaan Terbaru</Text>
        
        {healthRecords.length === 0 ? (
          <View style={styles.noRecordsContainer}>
            <Text style={styles.noRecordsText}>
              Belum ada riwayat pemeriksaan untuk lansia ini.
            </Text>
          </View>
        ) : (
          healthRecords.map((record, index) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {formatDateTime(record.examinationDate)}
                </Text>
                <Text style={styles.recordExaminer}>
                  oleh {(record as any).examined_by_name || 'Petugas'}
                </Text>
              </View>
              
              <View style={styles.recordContent}>
                {record.height && record.weight && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Tinggi/Berat:</Text>
                    <Text style={styles.recordValue}>
                      {record.height} cm / {record.weight} kg
                    </Text>
                  </View>
                )}
                
                {record.bmi && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>BMI:</Text>
                    <View style={styles.bmiContainer}>
                      <Text style={styles.recordValue}>{record.bmi.toFixed(1)}</Text>
                      <Text style={[
                        styles.bmiCategory,
                        { color: getBMICategory(record.bmi).color }
                      ]}>
                        ({getBMICategory(record.bmi).category})
                      </Text>
                    </View>
                  </View>
                )}
                
                {record.systolicBp && record.diastolicBp && (
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Tekanan Darah:</Text>
                    <View style={styles.bpContainer}>
                      <Text style={styles.recordValue}>
                        {record.systolicBp}/{record.diastolicBp} mmHg
                      </Text>
                      <Text style={[
                        styles.bpCategory,
                        { color: getBloodPressureCategory(record.systolicBp, record.diastolicBp).color }
                      ]}>
                        ({getBloodPressureCategory(record.systolicBp, record.diastolicBp).category})
                      </Text>
                    </View>
                  </View>
                )}
                
                {(record.uricAcid || record.bloodSugar || record.cholesterol) && (
                  <View style={styles.labResults}>
                    <Text style={styles.labTitle}>Hasil Lab:</Text>
                    {record.uricAcid && (
                      <Text style={styles.labValue}>
                        Asam Urat: {record.uricAcid} mg/dL
                      </Text>
                    )}
                    {record.bloodSugar && (
                      <Text style={styles.labValue}>
                        Gula Darah: {record.bloodSugar} mg/dL
                      </Text>
                    )}
                    {record.cholesterol && (
                      <Text style={styles.labValue}>
                        Kolesterol: {record.cholesterol} mg/dL
                      </Text>
                    )}
                  </View>
                )}
                
                {record.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Catatan:</Text>
                    <Text style={styles.notesText}>{record.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
        
        {healthRecords.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              router.push({
                pathname: '/health-history',
                params: { patientId: patientData.id.toString() },
              });
            }}
          >
            <Text style={styles.viewAllButtonText}>Lihat Semua Riwayat</Text>
          </TouchableOpacity>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  patientCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  patientPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  qrCode: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  patientDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.background,
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tabIconDefault,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  healthRecordsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  noRecordsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  noRecordsText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.background,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recordExaminer: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  recordContent: {
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    flex: 1,
  },
  recordValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  labResults: {
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  labTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  labValue: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
    marginBottom: 2,
  },
  notesContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
    lineHeight: 18,
  },
  viewAllButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '500',
  },
});
