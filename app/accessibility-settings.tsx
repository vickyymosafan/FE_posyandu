import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { accessibilityService, AccessibilitySettings } from '../utils/accessibility';

export default function AccessibilitySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AccessibilitySettings>(
    accessibilityService.getSettings()
  );

  useEffect(() => {
    // Apply settings immediately when changed
    accessibilityService.updateSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Pengaturan',
      'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaults = accessibilityService.getDefaultSettings();
            setSettings(defaults);
            accessibilityService.resetToDefaults();
            Alert.alert('Berhasil', 'Pengaturan telah direset ke default');
          },
        },
      ]
    );
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Kecil' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Besar' },
    { value: 'extra-large', label: 'Sangat Besar' },
  ] as const;

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
        <Text style={styles.title}>Pengaturan Aksesibilitas</Text>
        <Text style={styles.subtitle}>Sesuaikan tampilan untuk kemudahan penggunaan</Text>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {/* Font Size */}
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>Ukuran Teks</Text>
          <Text style={styles.sectionDescription}>
            Pilih ukuran teks yang nyaman untuk dibaca
          </Text>
          <View style={styles.optionsContainer}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  settings.fontSize === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => updateSetting('fontSize', option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    settings.fontSize === option.value && styles.optionTextSelected,
                    { fontSize: option.value === 'small' ? 14 : option.value === 'normal' ? 16 : option.value === 'large' ? 18 : 20 }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* High Contrast */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Kontras Tinggi</Text>
              <Text style={styles.settingDescription}>
                Meningkatkan kontras warna untuk visibilitas yang lebih baik
              </Text>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={(value) => updateSetting('highContrast', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.highContrast ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Large Buttons */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Tombol Besar</Text>
              <Text style={styles.settingDescription}>
                Memperbesar ukuran tombol untuk kemudahan sentuh
              </Text>
            </View>
            <Switch
              value={settings.largeButtons}
              onValueChange={(value) => updateSetting('largeButtons', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.largeButtons ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Haptic Feedback */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Getaran Sentuh</Text>
              <Text style={styles.settingDescription}>
                Memberikan getaran saat menyentuh tombol
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={(value) => updateSetting('hapticFeedback', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.hapticFeedback ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Slow Animations */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Animasi Lambat</Text>
              <Text style={styles.settingDescription}>
                Memperlambat animasi untuk kemudahan mengikuti
              </Text>
            </View>
            <Switch
              value={settings.slowAnimations}
              onValueChange={(value) => updateSetting('slowAnimations', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.slowAnimations ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Simplified UI */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Tampilan Sederhana</Text>
              <Text style={styles.settingDescription}>
                Menyederhanakan tampilan untuk kemudahan navigasi
              </Text>
            </View>
            <Switch
              value={settings.simplifiedUI}
              onValueChange={(value) => updateSetting('simplifiedUI', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.simplifiedUI ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Voice Assistance */}
        <View style={styles.settingSection}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Bantuan Suara</Text>
              <Text style={styles.settingDescription}>
                Mengaktifkan pembacaan teks oleh sistem (dalam pengembangan)
              </Text>
            </View>
            <Switch
              value={settings.voiceAssistance}
              onValueChange={(value) => updateSetting('voiceAssistance', value)}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={settings.voiceAssistance ? '#ffffff' : '#f4f3f4'}
              disabled={true} // Disabled for now
            />
          </View>
        </View>

        {/* Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Pratinjau</Text>
          <View style={styles.previewContainer}>
            <Text style={[
              styles.previewText,
              { fontSize: accessibilityService.getScaledFontSize(16) }
            ]}>
              Ini adalah contoh teks dengan pengaturan yang Anda pilih.
            </Text>
            <TouchableOpacity
              style={[
                styles.previewButton,
                {
                  minHeight: accessibilityService.getMinTouchTargetSize(),
                  backgroundColor: settings.highContrast ? '#000000' : Colors.light.tint,
                }
              ]}
            >
              <Text style={[
                styles.previewButtonText,
                { fontSize: accessibilityService.getScaledFontSize(16) }
              ]}>
                Contoh Tombol
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <Text style={styles.resetButtonText}>Reset ke Default</Text>
          </TouchableOpacity>
        </View>
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
  settingsContainer: {
    padding: 20,
  },
  settingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  optionText: {
    fontWeight: '500',
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: 'white',
  },
  previewSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewContainer: {
    alignItems: 'center',
    gap: 16,
  },
  previewText: {
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  previewButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resetSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.error,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
