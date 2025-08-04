import { Dimensions, PixelRatio } from 'react-native';
import { settingsStorage } from './storage';

export interface AccessibilitySettings {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  hapticFeedback: boolean;
  voiceAssistance: boolean;
  slowAnimations: boolean;
  largeButtons: boolean;
  simplifiedUI: boolean;
}

export class AccessibilityService {
  private static instance: AccessibilityService;
  private settingsKey = 'accessibility_settings';

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Get default accessibility settings optimized for elderly users
   */
  getDefaultSettings(): AccessibilitySettings {
    return {
      fontSize: 'large', // Default to large font for elderly users
      highContrast: true, // High contrast for better visibility
      hapticFeedback: true, // Haptic feedback for better interaction
      voiceAssistance: false, // Off by default, can be enabled
      slowAnimations: true, // Slower animations for better comprehension
      largeButtons: true, // Larger touch targets
      simplifiedUI: true, // Simplified interface
    };
  }

  /**
   * Get current accessibility settings
   */
  getSettings(): AccessibilitySettings {
    const stored = settingsStorage.getSetting(this.settingsKey);
    if (stored) {
      return { ...this.getDefaultSettings(), ...stored };
    }
    return this.getDefaultSettings();
  }

  /**
   * Update accessibility settings
   */
  updateSettings(settings: Partial<AccessibilitySettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    settingsStorage.setSetting(this.settingsKey, updated);
  }

  /**
   * Get font size multiplier based on accessibility settings
   */
  getFontSizeMultiplier(): number {
    const settings = this.getSettings();
    switch (settings.fontSize) {
      case 'small': return 0.9;
      case 'normal': return 1.0;
      case 'large': return 1.2;
      case 'extra-large': return 1.4;
      default: return 1.2; // Default to large for elderly users
    }
  }

  /**
   * Get scaled font size
   */
  getScaledFontSize(baseSize: number): number {
    const multiplier = this.getFontSizeMultiplier();
    const pixelRatio = PixelRatio.getFontScale();
    return Math.round(baseSize * multiplier * pixelRatio);
  }

  /**
   * Get button size multiplier
   */
  getButtonSizeMultiplier(): number {
    const settings = this.getSettings();
    return settings.largeButtons ? 1.3 : 1.0;
  }

  /**
   * Get minimum touch target size (44pt minimum for accessibility)
   */
  getMinTouchTargetSize(): number {
    const settings = this.getSettings();
    const baseSize = 44; // iOS HIG minimum
    return settings.largeButtons ? baseSize * 1.3 : baseSize;
  }

  /**
   * Get color scheme based on contrast settings
   */
  getColorScheme(): {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  } {
    const settings = this.getSettings();
    
    if (settings.highContrast) {
      return {
        primary: '#0066CC', // Darker blue for better contrast
        secondary: '#4A90E2',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#000000', // Pure black for maximum contrast
        textSecondary: '#333333',
        border: '#000000',
        error: '#CC0000', // Darker red
        success: '#006600', // Darker green
        warning: '#CC6600', // Darker orange
      };
    }
    
    return {
      primary: '#2563eb',
      secondary: '#64748b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
    };
  }

  /**
   * Get animation duration based on settings
   */
  getAnimationDuration(baseDuration: number): number {
    const settings = this.getSettings();
    return settings.slowAnimations ? baseDuration * 1.5 : baseDuration;
  }

  /**
   * Check if haptic feedback is enabled
   */
  isHapticFeedbackEnabled(): boolean {
    const settings = this.getSettings();
    return settings.hapticFeedback;
  }

  /**
   * Check if voice assistance is enabled
   */
  isVoiceAssistanceEnabled(): boolean {
    const settings = this.getSettings();
    return settings.voiceAssistance;
  }

  /**
   * Check if simplified UI is enabled
   */
  isSimplifiedUIEnabled(): boolean {
    const settings = this.getSettings();
    return settings.simplifiedUI;
  }

  /**
   * Get responsive breakpoints
   */
  getBreakpoints(): {
    small: number;
    medium: number;
    large: number;
  } {
    Dimensions.get('window');
    return {
      small: 320,
      medium: 768,
      large: 1024,
    };
  }

  /**
   * Check if device is in landscape mode
   */
  isLandscape(): boolean {
    const { width, height } = Dimensions.get('window');
    return width > height;
  }

  /**
   * Get safe padding for different screen sizes
   */
  getSafePadding(): {
    horizontal: number;
    vertical: number;
  } {
    const { width } = Dimensions.get('window');
    const settings = this.getSettings();
    
    let basePadding = 16;
    if (settings.largeButtons) {
      basePadding = 20;
    }
    
    // Adjust padding based on screen size
    if (width < 375) {
      return { horizontal: basePadding, vertical: basePadding };
    } else if (width > 768) {
      return { horizontal: basePadding * 1.5, vertical: basePadding * 1.2 };
    }
    
    return { horizontal: basePadding, vertical: basePadding };
  }

  /**
   * Get accessibility labels for screen readers
   */
  getAccessibilityLabel(
    element: string,
    value?: string,
    hint?: string
  ): {
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityRole?: string;
  } {
    let label = element;
    if (value) {
      label += `, ${value}`;
    }
    
    const result: any = {
      accessibilityLabel: label,
    };
    
    if (hint) {
      result.accessibilityHint = hint;
    }
    
    // Set appropriate accessibility role
    if (element.toLowerCase().includes('button')) {
      result.accessibilityRole = 'button';
    } else if (element.toLowerCase().includes('input')) {
      result.accessibilityRole = 'textbox';
    } else if (element.toLowerCase().includes('image')) {
      result.accessibilityRole = 'image';
    }
    
    return result;
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    const defaults = this.getDefaultSettings();
    settingsStorage.setSetting(this.settingsKey, defaults);
  }

  /**
   * Export settings for backup
   */
  exportSettings(): string {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson) as AccessibilitySettings;
      this.updateSettings(settings);
      return true;
    } catch (error) {
      console.error('Error importing accessibility settings:', error);
      return false;
    }
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Convenience functions
export const getScaledSize = (size: number): number => {
  return accessibilityService.getScaledFontSize(size);
};

export const getAccessibleColors = () => {
  return accessibilityService.getColorScheme();
};

export const getAccessibleTouchTarget = (): number => {
  return accessibilityService.getMinTouchTargetSize();
};

export const isHighContrastEnabled = (): boolean => {
  return accessibilityService.getSettings().highContrast;
};

export const isLargeFontEnabled = (): boolean => {
  const settings = accessibilityService.getSettings();
  return settings.fontSize === 'large' || settings.fontSize === 'extra-large';
};
