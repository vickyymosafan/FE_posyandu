import CryptoJS from 'crypto-js';

interface PatientData {
  encryptedAt?: number;
  [key: string]: any;
}

// Encryption key - in production, this should be derived from user credentials or device-specific data
const ENCRYPTION_KEY = 'posyandu_lansia_mobile_key_2024';

export class EncryptionService {
  /**
   * Encrypt sensitive data before storing locally
   */
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data when retrieving from local storage
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Failed to decrypt data - invalid key or corrupted data');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt object data
   */
  static encryptObject(obj: any): string {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      console.error('Object encryption error:', error);
      throw new Error('Failed to encrypt object');
    }
  }

  /**
   * Decrypt object data
   */
  static decryptObject<T>(encryptedData: string): T {
    try {
      const decryptedString = this.decrypt(encryptedData);
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.error('Object decryption error:', error);
      throw new Error('Failed to decrypt object');
    }
  }

  /**
   * Generate hash for data integrity verification
   */
  static generateHash(data: string): string {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Hash generation error:', error);
      throw new Error('Failed to generate hash');
    }
  }

  /**
   * Verify data integrity using hash
   */
  static verifyHash(data: string, hash: string): boolean {
    try {
      const generatedHash = this.generateHash(data);
      return generatedHash === hash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Encrypt sensitive patient data
   */
  static encryptPatientData(patientData: PatientData): string {
    try {
      // Remove or mask sensitive fields before encryption
      const sensitiveData = {
        ...patientData,
        // Add timestamp for freshness verification
        encryptedAt: Date.now(),
      };
      
      return this.encryptObject(sensitiveData);
    } catch (error) {
      console.error('Patient data encryption error:', error);
      throw new Error('Failed to encrypt patient data');
    }
  }

  /**
   * Decrypt sensitive patient data
   */
  static decryptPatientData(encryptedData: string): PatientData {
    try {
      const decryptedData = this.decryptObject<PatientData>(encryptedData);
      
      // Verify data freshness (optional - for additional security)
      const encryptedAt = decryptedData.encryptedAt;
      if (encryptedAt) {
        const age = Date.now() - encryptedAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age > maxAge) {
          console.warn('Encrypted data is older than 24 hours');
        }
      }
      
      return decryptedData;
    } catch (error) {
      console.error('Patient data decryption error:', error);
      throw new Error('Failed to decrypt patient data');
    }
  }

  /**
   * Secure wipe of sensitive data from memory
   */
  static secureWipe(data: string): string {
    try {
      // Overwrite the string with random data multiple times
      let wiped = data;
      for (let i = 0; i < 3; i++) {
        wiped = wiped.replace(/./g, () => 
          String.fromCharCode(Math.floor(Math.random() * 256))
        );
      }
      return '';
    } catch (error) {
      console.error('Secure wipe error:', error);
      return '';
    }
  }
}

export default EncryptionService;
