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
const advancedExamSchema = z.object({
  uricAcid: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 2.0 && num <= 15.0;
  }, 'Kadar asam urat harus antara 2.0-15.0 mg/dL'),
  bloodSugar: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 50 && num <= 500;
  }, 'Kadar gula darah harus antara 50-500 mg/dL'),
  cholesterol: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 100 && num <= 400;
  }, 'Kadar kolesterol harus antara 100-400 mg/dL'),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

type FormData = z.infer<typeof advancedExamSchema>;

export default function AdvancedExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(advancedExamSchema),
    defaultValues: {
      uricAcid: '',
      bloodSugar: '',
      cholesterol: '',
      notes: '',
    },
  });

  // Helper functions for value interpretation
  const getUricAcidStatus = (value: number): { status: string; color: string; description: string } => {
    if (value < 3.0) return { 
      status: 'Rendah', 
      color: '#f59e0b', 
      description: 'Kadar asam urat di bawah normal' 
    };
    if (value <= 7.0) return { 
      status: 'Normal', 
      color: '#10b981', 
      description: 'Kadar asam urat dalam batas normal' 
    };
    return { 
      status: 'Tinggi', 
      color: '#ef4444', 
      description: 'Kadar asam urat tinggi, berisiko asam urat' 
    };
  };

  const getBloodSugarStatus = (value: number): { status: string; color: string; description: string } => {
    if (value < 70) return { 
      status: 'Rendah', 
      color: '#ef4444', 
      description: 'Hipoglikemia - gula darah terlalu rendah' 
    };
    if (value <= 140) return { 
      status: 'Normal', 
      color: '#10b981', 
      description: 'Kadar gula darah normal' 
    };
    if (value <= 200) return { 
      status: 'Tinggi', 
      color: '#f59e0b', 
      description: 'Prediabetes - gula darah tinggi' 
    };
    return { 
      status: 'Sangat Tinggi', 
      color: '#ef4444', 
      description: 'Diabetes - gula darah sangat tinggi' 
    };
  };

  const getCholesterolStatus = (value: number): { status: string; color: string; description: string } => {
    if (value < 200) return { 
      status: 'Normal', 
      color: '#10b981', 
      description: 'Kadar kolesterol baik' 
    };
    if (value <= 240) return { 
      status: 'Batas Tinggi', 
      color: '#f59e0b', 
      description: 'Kolesterol mendekati tinggi' 
    };
    return { 
      status: 'Tinggi', 
      color: '#ef4444', 
      description: 'Kolesterol tinggi, berisiko penyakit jantung' 
    };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Prepare data for API
      const examData = {
        patientId: parseInt(patientId),
        uricAcid: data.uricAcid ? parseFloat(data.uricAcid) : undefined,
        bloodSugar: data.bloodSugar ? parseFloat(data.bloodSugar) : undefined,
        cholesterol: data.cholesterol ? parseFloat(data.cholesterol) : undefined,
        notes: data.notes || undefined,
      };

      // Validate that at least one lab result is provided
      if (!examData.uricAcid && !examData.bloodSugar && !examData.cholesterol) {
        Alert.alert(
          'Data Tidak Lengkap',
          'Harap isi minimal satu hasil laboratorium (asam urat, gula darah, atau kolesterol).',
          [{ text: 'OK' }]
        );
        return;
      }

      // Submit to API
      const response = await apiService.post('/health-records/advanced', examData);

      if (response.success) {
        const data = response.data as any;
        const warnings = data?.warnings || [];
        
        if (warnings.length > 0) {
          Alert.alert(
            'Peringatan Kesehatan!',
            `Data berhasil disimpan, namun ditemukan:\n\n• ${warnings.join('\n• ')}\n\nSilakan konsultasikan dengan dokter.`,
            [
              {
                text: 'Kembali ke Profil',
                onPress: () => router.back(),
              },
            ]
          );
        } else {
          Alert.alert(
            'Berhasil!',
            'Data pemeriksaan lanjutan berhasil disimpan.',
            [
              {
                text: 'Kembali ke Profil',
                onPress: () => router.back(),
              },
            ]
          );
        }
        
        // Reset form
        reset();
      }
    } catch (error) {
      console.error('Advanced exam error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal menyimpan data pemeriksaan. Silakan coba lagi.',
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
          <Text style={styles.title}>Pemeriksaan Lanjutan</Text>
          <Text style={styles.subtitle}>Hasil Laboratorium</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Uric Acid */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Asam Urat (mg/dL)</Text>
            <Controller
              control={control}
              name="uricAcid"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.uricAcid && styles.inputError]}
                  placeholder="Contoh: 6.5"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.uricAcid && (
              <Text style={styles.errorText}>{errors.uricAcid.message}</Text>
            )}
            
            {/* Uric Acid Status */}
            {watch('uricAcid') && (
              <View style={styles.statusContainer}>
                {(() => {
                  const value = parseFloat(watch('uricAcid') || '0');
                  if (!isNaN(value)) {
                    const { status, color, description } = getUricAcidStatus(value);
                    return (
                      <>
                        <Text style={[styles.statusText, { color }]}>
                          Status: {status}
                        </Text>
                        <Text style={styles.statusDescription}>{description}</Text>
                      </>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>

          {/* Blood Sugar */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gula Darah (mg/dL)</Text>
            <Controller
              control={control}
              name="bloodSugar"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.bloodSugar && styles.inputError]}
                  placeholder="Contoh: 120"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.bloodSugar && (
              <Text style={styles.errorText}>{errors.bloodSugar.message}</Text>
            )}
            
            {/* Blood Sugar Status */}
            {watch('bloodSugar') && (
              <View style={styles.statusContainer}>
                {(() => {
                  const value = parseFloat(watch('bloodSugar') || '0');
                  if (!isNaN(value)) {
                    const { status, color, description } = getBloodSugarStatus(value);
                    return (
                      <>
                        <Text style={[styles.statusText, { color }]}>
                          Status: {status}
                        </Text>
                        <Text style={styles.statusDescription}>{description}</Text>
                      </>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>

          {/* Cholesterol */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kolesterol Total (mg/dL)</Text>
            <Controller
              control={control}
              name="cholesterol"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.cholesterol && styles.inputError]}
                  placeholder="Contoh: 180"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.cholesterol && (
              <Text style={styles.errorText}>{errors.cholesterol.message}</Text>
            )}
            
            {/* Cholesterol Status */}
            {watch('cholesterol') && (
              <View style={styles.statusContainer}>
                {(() => {
                  const value = parseFloat(watch('cholesterol') || '0');
                  if (!isNaN(value)) {
                    const { status, color, description } = getCholesterolStatus(value);
                    return (
                      <>
                        <Text style={[styles.statusText, { color }]}>
                          Status: {status}
                        </Text>
                        <Text style={styles.statusDescription}>{description}</Text>
                      </>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>

          {/* Reference Values */}
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceTitle}>Nilai Rujukan Normal:</Text>
            <Text style={styles.referenceText}>• Asam Urat: 3.0 - 7.0 mg/dL</Text>
            <Text style={styles.referenceText}>• Gula Darah: 70 - 140 mg/dL</Text>
            <Text style={styles.referenceText}>• Kolesterol: &lt; 200 mg/dL</Text>
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Catatan Pemeriksaan</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.notes && styles.inputError]}
                  placeholder="Catatan tambahan tentang hasil laboratorium..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
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
              <Text style={styles.submitButtonText}>Simpan Hasil Laboratorium</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 18,
  },
  referenceContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
    lineHeight: 18,
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
