import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { apiService } from '../services/api';

// Validation schema
const patientRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi').max(255, 'Nama terlalu panjang'),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi'),
  address: z.string().min(1, 'Alamat lengkap wajib diisi'),
  phoneNumber: z.string().regex(/^[0-9+\-\s]*$/, 'Format nomor telepon tidak valid').optional(),
});

type FormData = z.infer<typeof patientRegistrationSchema>;

export default function PatientRegistrationScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      phoneNumber: '',
    },
  });

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi memerlukan izin untuk mengakses galeri foto.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih foto. Silakan coba lagi.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi memerlukan izin untuk mengakses kamera.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Pilih Foto',
      'Pilih sumber foto untuk lansia',
      [
        { text: 'Galeri', onPress: pickImage },
        { text: 'Kamera', onPress: takePhoto },
        { text: 'Batal', style: 'cancel' },
      ]
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('address', data.address);
      if (data.phoneNumber) {
        formData.append('phoneNumber', data.phoneNumber);
      }

      // Add photo if selected
      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: selectedImage,
          name: filename,
          type,
        } as any);
      }

      // Submit to API
      const response = await apiService.uploadFile('/patients', formData);

      if (response.success && response.data) {
        const data = response.data as any;
        Alert.alert(
          'Berhasil!',
          'Lansia berhasil didaftarkan. QR Code telah dibuat.',
          [
            {
              text: 'Lihat QR Code',
              onPress: () => {
                // Navigate to QR code display screen
                router.push({
                  pathname: '/qr-display',
                  params: {
                    patientData: JSON.stringify(data.patient),
                    qrCodeImage: data.qrCodeImage,
                  },
                });
              },
            },
          ]
        );
        
        // Reset form
        reset();
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal mendaftarkan lansia. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Daftar Lansia Baru</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Foto Lansia (Opsional)</Text>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={showImagePicker}
              disabled={isSubmitting}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>Tap untuk pilih foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Masukkan nama lengkap"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName.message}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tanggal Lahir *</Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.dateOfBirth && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
            )}
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Alamat Lengkap *</Text>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.address && styles.inputError]}
                  placeholder="Masukkan alamat lengkap"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address.message}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.inputError]}
                  placeholder="Masukkan nomor telepon"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Daftarkan Lansia</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  },
  form: {
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginTop: 10,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.tabIconDefault,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    color: Colors.light.tabIconDefault,
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.tabIconDefault,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
