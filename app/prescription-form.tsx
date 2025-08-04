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
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '../constants/Colors';
import { apiService } from '../services/api';

// Validation schema
const medicationSchema = z.object({
  name: z.string().min(1, 'Nama obat wajib diisi').max(255, 'Nama obat terlalu panjang'),
  dosage: z.string().min(1, 'Dosis wajib diisi').max(100, 'Dosis terlalu panjang'),
  frequency: z.string().min(1, 'Frekuensi wajib diisi').max(100, 'Frekuensi terlalu panjang'),
  duration: z.string().min(1, 'Durasi wajib diisi').max(100, 'Durasi terlalu panjang'),
  instructions: z.string().max(500, 'Instruksi terlalu panjang').optional(),
});

const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis wajib diisi').max(500, 'Diagnosis terlalu panjang'),
  medications: z.array(medicationSchema).min(1, 'Minimal satu obat harus diisi'),
  notes: z.string().max(1000, 'Catatan terlalu panjang').optional(),
});

type FormData = z.infer<typeof prescriptionSchema>;

export default function PrescriptionFormScreen() {
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
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: '',
      medications: [
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const addMedication = () => {
    append({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const removeMedication = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      Alert.alert('Peringatan', 'Minimal satu obat harus diisi');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Prepare data for API
      const prescriptionData = {
        patientId: parseInt(patientId),
        diagnosis: data.diagnosis,
        medications: data.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || undefined,
        })),
        notes: data.notes || undefined,
      };

      // Submit to API
      const response = await apiService.post('/prescriptions', prescriptionData);

      if (response.success) {
        Alert.alert(
          'Berhasil!',
          'Resep berhasil dibuat dan disimpan.',
          [
            {
              text: 'Cetak Resep',
              onPress: () => {
                // Navigate to prescription display/print screen
                router.push({
                  pathname: '/prescription-display',
                  params: {
                    prescriptionData: JSON.stringify(response.data),
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
      console.error('Prescription error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Gagal membuat resep. Silakan coba lagi.',
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
          <Text style={styles.title}>Buat Resep Digital</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Diagnosis */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Diagnosis *</Text>
            <Controller
              control={control}
              name="diagnosis"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.diagnosis && styles.inputError]}
                  placeholder="Masukkan diagnosis pasien..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.diagnosis && (
              <Text style={styles.errorText}>{errors.diagnosis.message}</Text>
            )}
          </View>

          {/* Medications */}
          <View style={styles.medicationsContainer}>
            <View style={styles.medicationsHeader}>
              <Text style={styles.sectionTitle}>Daftar Obat *</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addMedication}
                disabled={isSubmitting}
              >
                <Text style={styles.addButtonText}>+ Tambah Obat</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} style={styles.medicationCard}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationTitle}>Obat {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeMedication(index)}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.removeButtonText}>Hapus</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Medication Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nama Obat *</Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.name`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.medications?.[index]?.name && styles.inputError,
                        ]}
                        placeholder="Contoh: Paracetamol"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!isSubmitting}
                      />
                    )}
                  />
                  {errors.medications?.[index]?.name && (
                    <Text style={styles.errorText}>
                      {errors.medications[index]?.name?.message}
                    </Text>
                  )}
                </View>

                {/* Dosage */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Dosis *</Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.dosage`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.medications?.[index]?.dosage && styles.inputError,
                        ]}
                        placeholder="Contoh: 500mg"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!isSubmitting}
                      />
                    )}
                  />
                  {errors.medications?.[index]?.dosage && (
                    <Text style={styles.errorText}>
                      {errors.medications[index]?.dosage?.message}
                    </Text>
                  )}
                </View>

                {/* Frequency */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Frekuensi *</Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.frequency`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.medications?.[index]?.frequency && styles.inputError,
                        ]}
                        placeholder="Contoh: 3x sehari"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!isSubmitting}
                      />
                    )}
                  />
                  {errors.medications?.[index]?.frequency && (
                    <Text style={styles.errorText}>
                      {errors.medications[index]?.frequency?.message}
                    </Text>
                  )}
                </View>

                {/* Duration */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Durasi *</Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.duration`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.medications?.[index]?.duration && styles.inputError,
                        ]}
                        placeholder="Contoh: 7 hari"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!isSubmitting}
                      />
                    )}
                  />
                  {errors.medications?.[index]?.duration && (
                    <Text style={styles.errorText}>
                      {errors.medications[index]?.duration?.message}
                    </Text>
                  )}
                </View>

                {/* Instructions */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Instruksi Khusus</Text>
                  <Controller
                    control={control}
                    name={`medications.${index}.instructions`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.textArea,
                          errors.medications?.[index]?.instructions && styles.inputError,
                        ]}
                        placeholder="Contoh: Diminum setelah makan"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={2}
                        editable={!isSubmitting}
                      />
                    )}
                  />
                  {errors.medications?.[index]?.instructions && (
                    <Text style={styles.errorText}>
                      {errors.medications[index]?.instructions?.message}
                    </Text>
                  )}
                </View>
              </View>
            ))}
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
                  placeholder="Catatan tambahan untuk pasien atau apoteker..."
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
              <Text style={styles.submitButtonText}>Buat Resep</Text>
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
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  medicationsContainer: {
    marginBottom: 20,
  },
  medicationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.background,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
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
