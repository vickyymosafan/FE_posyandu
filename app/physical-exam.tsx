import React, { useState, useEffect } from 'react';
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
const physicalExamSchema = z.object({
  height: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 100 && num <= 200;
  }, 'Tinggi badan harus antara 100-200 cm'),
  weight: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseFloat(val);
    return !isNaN(num) && num >= 30 && num <= 150;
  }, 'Berat badan harus antara 30-150 kg'),
  systolicBp: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 70 && num <= 250;
  }, 'Tekanan sistolik harus antara 70-250 mmHg'),
  diastolicBp: z.string().optional().refine((val) => {
    if (!val || val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num >= 40 && num <= 150;
  }, 'Tekanan diastolik harus antara 40-150 mmHg'),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

type FormData = z.infer<typeof physicalExamSchema>;

export default function PhysicalExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: {
      height: '',
      weight: '',
      systolicBp: '',
      diastolicBp: '',
      notes: '',
    },
  });

  // Watch height and weight for BMI calculation
  const height = watch('height');
  const weight = watch('weight');

  useEffect(() => {
    if (height && weight) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      
      if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
        const heightInMeters = h / 100;
        const bmi = w / (heightInMeters * heightInMeters);
        setCalculatedBMI(bmi);
        
        // Determine BMI category
        if (bmi < 18.5) {
          setBmiCategory('Kurus');
        } else if (bmi < 25) {
          setBmiCategory('Normal');
        } else if (bmi < 30) {
          setBmiCategory('Gemuk');
        } else {
          setBmiCategory('Obesitas');
        }
      } else {
        setCalculatedBMI(null);
        setBmiCategory('');
      }
    } else {
      setCalculatedBMI(null);
      setBmiCategory('');
    }
  }, [height, weight]);

  const getBMIColor = (category: string): string => {
    switch (category) {
      case 'Normal': return '#10b981';
      case 'Kurus': return '#f59e0b';
      case 'Gemuk': return '#f59e0b';
      case 'Obesitas': return '#ef4444';
      default: return Colors.light.tabIconDefault;
    }
  };

  const getBloodPressureCategory = (systolic: number, diastolic: number): { category: string; color: string } => {
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', color: '#10b981' };
    if (systolic < 130 && diastolic < 80) return { category: 'Tinggi Normal', color: '#f59e0b' };
    if (systolic < 140 || diastolic < 90) return { category: 'Hipertensi Tingkat 1', color: '#f59e0b' };
    return { category: 'Hipertensi Tingkat 2', color: '#ef4444' };
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Prepare data for API
      const examData = {
        patientId: parseInt(patientId),
        height: data.height ? parseFloat(data.height) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        systolicBp: data.systolicBp ? parseInt(data.systolicBp) : undefined,
        diastolicBp: data.diastolicBp ? parseInt(data.diastolicBp) : undefined,
        notes: data.notes || undefined,
      };

      // Validate that at least one measurement is provided
      if (!examData.height && !examData.weight && !examData.systolicBp && !examData.diastolicBp) {
        Alert.alert(
          'Data Tidak Lengkap',
          'Harap isi minimal satu data pemeriksaan (tinggi, berat, atau tekanan darah).',
          [{ text: 'OK' }]
        );
        return;
      }

      // Submit to API
      const response = await apiService.post('/health-records/physical', examData);

      if (response.success) {
        Alert.alert(
          'Berhasil!',
          'Data pemeriksaan fisik berhasil disimpan.',
          [
            {
              text: 'Kembali ke Profil',
              onPress: () => router.back(),
            },
            {
              text: 'Pemeriksaan Lanjutan',
              onPress: () => {
                router.replace({
                  pathname: '/advanced-exam',
                  params: { patientId },
                });
              },
            },
          ]
        );
        
        // Reset form
        reset();
        setCalculatedBMI(null);
        setBmiCategory('');
      }
    } catch (error) {
      console.error('Physical exam error:', error);
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
          <Text style={styles.title}>Pemeriksaan Fisik</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Height */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tinggi Badan (cm)</Text>
            <Controller
              control={control}
              name="height"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.height && styles.inputError]}
                  placeholder="Contoh: 165"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.height && (
              <Text style={styles.errorText}>{errors.height.message}</Text>
            )}
          </View>

          {/* Weight */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Berat Badan (kg)</Text>
            <Controller
              control={control}
              name="weight"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.weight && styles.inputError]}
                  placeholder="Contoh: 65"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight.message}</Text>
            )}
          </View>

          {/* BMI Display */}
          {calculatedBMI && (
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiLabel}>BMI (Body Mass Index)</Text>
              <View style={styles.bmiDisplay}>
                <Text style={styles.bmiValue}>{calculatedBMI.toFixed(1)}</Text>
                <Text style={[styles.bmiCategory, { color: getBMIColor(bmiCategory) }]}>
                  {bmiCategory}
                </Text>
              </View>
            </View>
          )}

          {/* Blood Pressure */}
          <View style={styles.bloodPressureContainer}>
            <Text style={styles.label}>Tekanan Darah (mmHg)</Text>
            <View style={styles.bloodPressureInputs}>
              <View style={styles.bpInputContainer}>
                <Text style={styles.bpLabel}>Sistolik</Text>
                <Controller
                  control={control}
                  name="systolicBp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.bpInput, errors.systolicBp && styles.inputError]}
                      placeholder="120"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>
              
              <Text style={styles.bpSeparator}>/</Text>
              
              <View style={styles.bpInputContainer}>
                <Text style={styles.bpLabel}>Diastolik</Text>
                <Controller
                  control={control}
                  name="diastolicBp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.bpInput, errors.diastolicBp && styles.inputError]}
                      placeholder="80"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      editable={!isSubmitting}
                    />
                  )}
                />
              </View>
            </View>
            
            {(errors.systolicBp || errors.diastolicBp) && (
              <Text style={styles.errorText}>
                {errors.systolicBp?.message || errors.diastolicBp?.message}
              </Text>
            )}

            {/* Blood Pressure Category */}
            {watch('systolicBp') && watch('diastolicBp') && (
              <View style={styles.bpCategoryContainer}>
                {(() => {
                  const systolic = parseInt(watch('systolicBp') || '0');
                  const diastolic = parseInt(watch('diastolicBp') || '0');
                  if (!isNaN(systolic) && !isNaN(diastolic)) {
                    const { category, color } = getBloodPressureCategory(systolic, diastolic);
                    return (
                      <Text style={[styles.bpCategory, { color }]}>
                        Kategori: {category}
                      </Text>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
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
                  placeholder="Catatan tambahan tentang kondisi pasien..."
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
              <Text style={styles.submitButtonText}>Simpan Data Pemeriksaan</Text>
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
  bmiContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  bmiDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  bmiCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  bloodPressureContainer: {
    marginBottom: 20,
  },
  bloodPressureInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bpInputContainer: {
    flex: 1,
  },
  bpLabel: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
    textAlign: 'center',
  },
  bpInput: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  bpSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 16,
    marginTop: 20,
  },
  bpCategoryContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  bpCategory: {
    fontSize: 14,
    fontWeight: '500',
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
