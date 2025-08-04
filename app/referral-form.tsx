import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '../constants/Colors';
import { apiService } from '../services/api';

// Validation schema
const referralSchema = z.object({
  referralTo: z.string().min(1, 'Tujuan rujukan wajib diisi').max(255, 'Tujuan rujukan terlalu panjang'),
  specialist: z.string().min(1, 'Spesialis wajib diisi').max(255, 'Spesialis terlalu panjang'),
  reason: z.string().min(1, 'Alasan rujukan wajib diisi').max(1000, 'Alasan rujukan terlalu panjang'),
  urgency: z.enum(['normal', 'urgent', 'emergency'], {
    errorMap: () => ({ message: 'Pilih tingkat urgensi' })
  }),
  notes: z.string().max(1000, 'Catatan terlalu panjang').optional(),
});

type FormData = z.infer<typeof referralSchema>;

export default function ReferralFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      referralTo: '',
      specialist: '',
      reason: '',
      urgency: 'normal',
      notes: '',
    },
  });

  const urgencyOptions = [
    { value: 'normal', label: 'Normal', color: '#10b981', description: 'Rujukan rutin' },
    { value: 'urgent', label: 'Mendesak', color: '#f59e0b', description: 'Perlu segera ditangani' },
    { value: 'emergency', label: 'Darurat', color: '#ef4444', description: 'Butuh penanganan segera' },
  ];

  const specialistOptions = [
    'Dokter Spesialis Dalam',
    'Dokter Spesialis Jantung',
    'Dokter Spesialis Mata',
    'Dokter Spesialis THT',
    'Dokter Spesialis Kulit',
    'Dokter Spesialis Saraf',
    'Dokter Spesialis Orthopedi',
    'Dokter Spesialis Paru',
    'Dokter Spesialis Ginjal',
    'Dokter Spesialis Geriatri',
  ];

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Prepare data for API
      const referralData = {
        patientId: parseInt(patientId),
        referralTo: data.referralTo,
        specialist: data.specialist,
        reason: data.reason,
        urgency: data.urgency,
        notes: data.notes || undefined,
      };

      // Submit to API
      const response = await apiService.post('/prescriptions/referrals', referralData);

      if (response.success) {
        Alert.alert(
          'Berhasil!',
          'Surat rujukan berhasil dibuat dan disimpan.',
          [
            {
              text: 'Cetak Rujukan',
              onPress: () => {
                // Navigate to referral display/print screen
                router.push({
                  pathname: '/referral-display',
                  params: {
                    referralData: JSON.stringify(response.data),
                  },
                });
              },
            },
            {
              text: 'Kembali',
              onPress: () => router.back(),
            },
          ]
        );
        
        // Reset form
        reset();
      }
    } catch (error) {
      console.error('Referral error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal membuat rujukan. Silakan coba lagi.',
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
          <Text style={styles.title}>Buat Surat Rujukan</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Referral To */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tujuan Rujukan *</Text>
            <Controller
              control={control}
              name="referralTo"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.referralTo && styles.inputError]}
                  placeholder="Contoh: RSUD Dr. Soetomo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.referralTo && (
              <Text style={styles.errorText}>{errors.referralTo.message}</Text>
            )}
          </View>

          {/* Specialist */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Spesialis *</Text>
            <Controller
              control={control}
              name="specialist"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.specialist && styles.inputError]}
                    placeholder="Pilih atau ketik spesialis"
                    value={value}
                    onChangeText={onChange}
                    editable={!isSubmitting}
                  />
                  <View style={styles.specialistOptions}>
                    <Text style={styles.optionsTitle}>Pilihan Spesialis:</Text>
                    <View style={styles.optionsGrid}>
                      {specialistOptions.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionChip,
                            value === option && styles.optionChipSelected,
                          ]}
                          onPress={() => onChange(option)}
                          disabled={isSubmitting}
                        >
                          <Text
                            style={[
                              styles.optionChipText,
                              value === option && styles.optionChipTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            />
            {errors.specialist && (
              <Text style={styles.errorText}>{errors.specialist.message}</Text>
            )}
          </View>

          {/* Urgency */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tingkat Urgensi *</Text>
            <Controller
              control={control}
              name="urgency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.urgencyContainer}>
                  {urgencyOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.urgencyOption,
                        value === option.value && styles.urgencyOptionSelected,
                        { borderColor: option.color },
                        value === option.value && { backgroundColor: `${option.color}20` },
                      ]}
                      onPress={() => onChange(option.value)}
                      disabled={isSubmitting}
                    >
                      <View style={styles.urgencyContent}>
                        <Text
                          style={[
                            styles.urgencyLabel,
                            value === option.value && { color: option.color },
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.urgencyDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            {errors.urgency && (
              <Text style={styles.errorText}>{errors.urgency.message}</Text>
            )}
          </View>

          {/* Reason */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Alasan Rujukan *</Text>
            <Controller
              control={control}
              name="reason"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.reason && styles.inputError]}
                  placeholder="Jelaskan alasan rujukan, kondisi pasien, dan pemeriksaan yang diperlukan..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.reason && (
              <Text style={styles.errorText}>{errors.reason.message}</Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Catatan Tambahan</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.notes && styles.inputError]}
                  placeholder="Catatan tambahan untuk dokter penerima rujukan..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.notes && (
              <Text style={styles.errorText}>{errors.notes.message}</Text>
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
              <Text style={styles.submitButtonText}>Buat Surat Rujukan</Text>
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
    minHeight: 100,
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
  specialistOptions: {
    marginTop: 12,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  optionChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  optionChipText: {
    fontSize: 12,
    color: Colors.light.text,
  },
  optionChipTextSelected: {
    color: 'white',
  },
  urgencyContainer: {
    gap: 12,
  },
  urgencyOption: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
  },
  urgencyOptionSelected: {
    borderWidth: 2,
  },
  urgencyContent: {
    alignItems: 'center',
  },
  urgencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  urgencyDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
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
