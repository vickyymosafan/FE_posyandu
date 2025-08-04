import { settingsStorage } from '../utils/storage';
import { EncryptionService } from '../utils/encryption';

export interface ActivityLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  category: 'auth' | 'patient' | 'examination' | 'prescription' | 'referral' | 'system';
  details: string;
  patientId?: string;
  sensitive: boolean;
  deviceInfo?: {
    platform: string;
    version: string;
  };
}

export class ActivityLogger {
  private static instance: ActivityLogger;
  private maxLogs = 1000; // Maximum number of logs to keep
  private logKey = 'activity_logs';

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  /**
   * Log user activity
   */
  async logActivity(
    userId: string,
    action: string,
    category: ActivityLog['category'],
    details: string,
    patientId?: string,
    sensitive: boolean = false
  ): Promise<void> {
    try {
      const log: ActivityLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        userId,
        action,
        category,
        details: sensitive ? EncryptionService.encrypt(details) : details,
        patientId,
        sensitive,
        deviceInfo: {
          platform: 'mobile', // Could be more specific
          version: '1.0.0', // App version
        },
      };

      // Get existing logs
      const existingLogs = this.getLogs();
      
      // Add new log
      existingLogs.unshift(log);
      
      // Keep only the most recent logs
      if (existingLogs.length > this.maxLogs) {
        existingLogs.splice(this.maxLogs);
      }
      
      // Store logs (encrypted)
      const encryptedLogs = EncryptionService.encryptObject(existingLogs);
      settingsStorage.setSetting(this.logKey, encryptedLogs);
      
      console.log(`Activity logged: ${action} by user ${userId}`);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid disrupting app flow
    }
  }

  /**
   * Get activity logs
   */
  getLogs(): ActivityLog[] {
    try {
      const encryptedLogs = settingsStorage.getSetting(this.logKey);
      if (!encryptedLogs) {
        return [];
      }
      
      const logs = EncryptionService.decryptObject<ActivityLog[]>(encryptedLogs);
      return logs || [];
    } catch (error) {
      console.error('Error retrieving activity logs:', error);
      return [];
    }
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string): ActivityLog[] {
    const allLogs = this.getLogs();
    return allLogs.filter(log => log.userId === userId);
  }

  /**
   * Get logs for a specific patient
   */
  getPatientLogs(patientId: string): ActivityLog[] {
    const allLogs = this.getLogs();
    return allLogs.filter(log => log.patientId === patientId);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: ActivityLog['category']): ActivityLog[] {
    const allLogs = this.getLogs();
    return allLogs.filter(log => log.category === category);
  }

  /**
   * Get logs within date range
   */
  getLogsByDateRange(startDate: Date, endDate: Date): ActivityLog[] {
    const allLogs = this.getLogs();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return allLogs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  /**
   * Get decrypted log details (for sensitive logs)
   */
  getDecryptedDetails(log: ActivityLog): string {
    if (!log.sensitive) {
      return log.details;
    }
    
    try {
      return EncryptionService.decrypt(log.details);
    } catch (error) {
      console.error('Error decrypting log details:', error);
      return '[Encrypted - Unable to decrypt]';
    }
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(daysToKeep: number = 30): void {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const allLogs = this.getLogs();
      const recentLogs = allLogs.filter(log => log.timestamp > cutoffTime);
      
      const encryptedLogs = EncryptionService.encryptObject(recentLogs);
      settingsStorage.setSetting(this.logKey, encryptedLogs);
      
      console.log(`Cleared ${allLogs.length - recentLogs.length} old logs`);
    } catch (error) {
      console.error('Error clearing old logs:', error);
    }
  }

  /**
   * Clear all logs
   */
  clearAllLogs(): void {
    try {
      settingsStorage.setSetting(this.logKey, null);
      console.log('All activity logs cleared');
    } catch (error) {
      console.error('Error clearing all logs:', error);
    }
  }

  /**
   * Get log statistics
   */
  getLogStatistics(): {
    totalLogs: number;
    logsByCategory: Record<string, number>;
    oldestLog: Date | null;
    newestLog: Date | null;
  } {
    const logs = this.getLogs();
    
    const logsByCategory: Record<string, number> = {};
    logs.forEach(log => {
      logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1;
    });
    
    const timestamps = logs.map(log => log.timestamp);
    const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : null;
    const newestTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : null;
    
    return {
      totalLogs: logs.length,
      logsByCategory,
      oldestLog: oldestTimestamp ? new Date(oldestTimestamp) : null,
      newestLog: newestTimestamp ? new Date(newestTimestamp) : null,
    };
  }

  /**
   * Export logs for audit purposes
   */
  exportLogs(): string {
    try {
      const logs = this.getLogs();
      const exportData = logs.map(log => ({
        ...log,
        details: this.getDecryptedDetails(log),
        timestamp: new Date(log.timestamp).toISOString(),
      }));
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting logs:', error);
      return '[]';
    }
  }
}

// Convenience functions for common logging scenarios
export const logUserLogin = (userId: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'LOGIN',
    'auth',
    'User logged in successfully'
  );
};

export const logUserLogout = (userId: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'LOGOUT',
    'auth',
    'User logged out'
  );
};

export const logPatientRegistration = (userId: string, patientId: string, patientName: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'PATIENT_REGISTERED',
    'patient',
    `Registered new patient: ${patientName}`,
    patientId,
    true // Sensitive because it contains patient name
  );
};

export const logHealthExamination = (userId: string, patientId: string, examType: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'HEALTH_EXAMINATION',
    'examination',
    `Conducted ${examType} examination`,
    patientId
  );
};

export const logPrescriptionCreated = (userId: string, patientId: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'PRESCRIPTION_CREATED',
    'prescription',
    'Created digital prescription',
    patientId
  );
};

export const logReferralCreated = (userId: string, patientId: string, referralTo: string) => {
  ActivityLogger.getInstance().logActivity(
    userId,
    'REFERRAL_CREATED',
    'referral',
    `Created referral to ${referralTo}`,
    patientId,
    true // Sensitive because it contains referral destination
  );
};

// Export singleton instance
export const activityLogger = ActivityLogger.getInstance();
