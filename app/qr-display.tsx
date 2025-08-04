import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '../constants/Colors';
import { Patient } from '../types';

export default function QRDisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse patient data and QR code image from params
  const patientData: Patient = JSON.parse(params.patientData as string);
  const qrCodeImage = params.qrCodeImage as string;

  const handlePrint = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>QR Code Lansia - ${patientData.fullName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .header {
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
            }
            .patient-info {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
            .info-row {
              margin-bottom: 10px;
            }
            .label {
              font-weight: bold;
              color: #333;
            }
            .value {
              color: #666;
            }
            .qr-section {
              margin: 30px 0;
            }
            .qr-code {
              max-width: 200px;
              height: auto;
              margin: 20px auto;
              display: block;
            }
            .qr-text {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Posyandu Lansia</div>
            <div class="subtitle">Sistem Informasi Kesehatan</div>
          </div>
          
          <div class="patient-info">
            <div class="info-row">
              <span class="label">Nama Lengkap: </span>
              <span class="value">${patientData.fullName}</span>
            </div>
            <div class="info-row">
              <span class="label">Tanggal Lahir: </span>
              <span class="value">${new Date(patientData.dateOfBirth).toLocaleDateString('id-ID')}</span>
            </div>
            <div class="info-row">
              <span class="label">Alamat: </span>
              <span class="value">${patientData.address}</span>
            </div>
            ${patientData.phoneNumber ? `
            <div class="info-row">
              <span class="label">Telepon: </span>
              <span class="value">${patientData.phoneNumber}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="qr-section">
            <img src="${qrCodeImage}" alt="QR Code" class="qr-code" />
            <div class="qr-text">${patientData.qrCode}</div>
          </div>
          
          <div class="footer">
            <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
            <p>Simpan QR Code ini untuk pemeriksaan kesehatan selanjutnya</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Gagal mencetak QR Code. Silakan coba lagi.');
    }
  };

  const handleShare = async () => {
    try {
      const message = `QR Code Lansia - ${patientData.fullName}\n\nKode: ${patientData.qrCode}\n\nSimpan QR Code ini untuk pemeriksaan kesehatan di Posyandu.`;
      
      await Share.share({
        message,
        title: 'QR Code Lansia',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Gagal membagikan QR Code. Silakan coba lagi.');
    }
  };

  const handleSaveAndContinue = () => {
    Alert.alert(
      'QR Code Tersimpan',
      'QR Code telah berhasil dibuat. Pastikan lansia menyimpan QR Code ini untuk pemeriksaan selanjutnya.',
      [
        {
          text: 'Daftar Lansia Lain',
          onPress: () => router.replace('/patient-registration'),
        },
        {
          text: 'Kembali ke Beranda',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>QR Code Berhasil Dibuat!</Text>
        <Text style={styles.subtitle}>Lansia telah terdaftar dalam sistem</Text>
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfo}>
        <Text style={styles.sectionTitle}>Informasi Lansia</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nama Lengkap:</Text>
          <Text style={styles.value}>{patientData.fullName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tanggal Lahir:</Text>
          <Text style={styles.value}>
            {new Date(patientData.dateOfBirth).toLocaleDateString('id-ID')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Alamat:</Text>
          <Text style={styles.value}>{patientData.address}</Text>
        </View>
        
        {patientData.phoneNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Telepon:</Text>
            <Text style={styles.value}>{patientData.phoneNumber}</Text>
          </View>
        )}
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>QR Code</Text>
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrCodeImage }} style={styles.qrCode} />
          <Text style={styles.qrCodeText}>{patientData.qrCode}</Text>
        </View>
        
        <Text style={styles.instruction}>
          Simpan atau cetak QR Code ini untuk pemeriksaan kesehatan selanjutnya
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Text style={styles.printButtonText}>📄 Cetak QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Bagikan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.continueButton} onPress={handleSaveAndContinue}>
          <Text style={styles.continueButtonText}>✓ Selesai</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  patientInfo: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.background,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tabIconDefault,
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 2,
    textAlign: 'right',
  },
  qrSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  instruction: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
  },
  printButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  printButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
