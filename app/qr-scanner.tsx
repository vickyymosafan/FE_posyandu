import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { Colors } from '../constants/Colors';
import { apiService } from '../services/api';

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      // Validate QR code format (should start with LANSIA-)
      if (!data.startsWith('LANSIA-')) {
        Alert.alert(
          'QR Code Tidak Valid',
          'QR Code yang dipindai bukan QR Code lansia yang valid.',
          [
            {
              text: 'Scan Lagi',
              onPress: () => {
                setScanned(false);
                setIsLoading(false);
              },
            },
            {
              text: 'Kembali',
              onPress: () => router.back(),
            },
          ]
        );
        return;
      }

      // Fetch patient data from API
      const response = await apiService.get(`/patients/${data}`);

      if (response.success && response.data) {
        const data = response.data as any;
        // Navigate to patient profile
        router.push({
          pathname: '/patient-profile',
          params: {
            patientData: JSON.stringify(data.patient),
            healthRecords: JSON.stringify(data.recentHealthRecords || []),
          },
        });
      } else {
        Alert.alert(
          'Lansia Tidak Ditemukan',
          'QR Code tidak valid atau lansia tidak terdaftar dalam sistem.',
          [
            {
              text: 'Scan Lagi',
              onPress: () => {
                setScanned(false);
                setIsLoading(false);
              },
            },
            {
              text: 'Kembali',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert(
        'Error',
        'Terjadi kesalahan saat memproses QR Code. Silakan coba lagi.',
        [
          {
            text: 'Scan Lagi',
            onPress: () => {
              setScanned(false);
              setIsLoading(false);
            },
          },
          {
            text: 'Kembali',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permissionText}>
            Aplikasi memerlukan akses kamera untuk memindai QR Code lansia.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={styles.permissionButtonText}>Berikan Izin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.headerBackButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code Lansia</Text>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingOverlayText}>Memproses QR Code...</Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Cara Memindai:</Text>
        <Text style={styles.instructionText}>
          • Arahkan kamera ke QR Code lansia{'\n'}
          • Pastikan QR Code berada dalam frame{'\n'}
          • Tunggu hingga QR Code terbaca otomatis
        </Text>
        
        {scanned && !isLoading && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainButtonText}>Scan Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: Colors.light.tint,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    marginRight: 16,
  },
  headerBackButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  instructions: {
    backgroundColor: 'white',
    padding: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  scanAgainButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  scanAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 200,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  backButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: Colors.light.text,
    fontSize: 16,
    marginTop: 16,
  },
});
