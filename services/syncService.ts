import NetInfo from '@react-native-community/netinfo';
import { offlineStorage, tokenStorage } from '../utils/storage';
import { apiService } from './api';
import { EncryptionService } from '../utils/encryption';

export interface SyncItem {
  id: string;
  type: 'patient' | 'health_record' | 'prescription' | 'referral';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
  encrypted: boolean;
}

export class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private maxRetries = 3;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize sync service with periodic sync
   */
  initialize(): void {
    // Start periodic sync every 5 minutes when online
    this.startPeriodicSync();
    
    // Listen for network state changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.syncOfflineData();
      }
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && !this.syncInProgress) {
        this.syncOfflineData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Add data to offline queue for later sync
   */
  async addToOfflineQueue(
    type: SyncItem['type'],
    action: SyncItem['action'],
    data: any,
    encrypt: boolean = true
  ): Promise<void> {
    try {
      const syncItem: SyncItem = {
        id: `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        action,
        data: encrypt ? EncryptionService.encryptObject(data) : data,
        timestamp: Date.now(),
        retryCount: 0,
        encrypted: encrypt,
      };

      offlineStorage.setOfflineData(syncItem.id, syncItem);
      
      console.log(`Added ${type} ${action} to offline queue:`, syncItem.id);

      // Try to sync immediately if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        this.syncOfflineData();
      }
    } catch (error) {
      console.error('Error adding to offline queue:', error);
      throw error;
    }
  }

  /**
   * Sync all offline data to server
   */
  async syncOfflineData(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    try {
      this.syncInProgress = true;
      console.log('Starting offline data sync...');

      // Check if user is authenticated
      if (!tokenStorage.isTokenValid()) {
        console.log('User not authenticated, skipping sync');
        return;
      }

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No network connection, skipping sync');
        return;
      }

      const unsyncedData = offlineStorage.getUnsyncedData();
      const syncItems = Object.values(unsyncedData) as SyncItem[];

      if (syncItems.length === 0) {
        console.log('No offline data to sync');
        return;
      }

      console.log(`Syncing ${syncItems.length} offline items...`);

      // Sort by timestamp to maintain order
      syncItems.sort((a, b) => a.timestamp - b.timestamp);

      let successCount = 0;
      let failureCount = 0;

      for (const item of syncItems) {
        try {
          await this.syncSingleItem(item);
          offlineStorage.markAsSynced(item.id);
          successCount++;
          console.log(`Successfully synced item: ${item.id}`);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          if (item.retryCount >= this.maxRetries) {
            console.error(`Max retries reached for item ${item.id}, removing from queue`);
            offlineStorage.markAsSynced(item.id); // Remove from queue
            failureCount++;
          } else {
            // Update retry count in storage
            offlineStorage.setOfflineData(item.id, item);
            failureCount++;
          }
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failures`);
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a single item to the server
   */
  private async syncSingleItem(item: SyncItem): Promise<void> {
    try {
      // Decrypt data if encrypted
      const data = item.encrypted 
        ? EncryptionService.decryptObject(item.data)
        : item.data;

      let endpoint = '';
      let method = 'POST';

      // Determine API endpoint based on type and action
      switch (item.type) {
        case 'patient':
          endpoint = item.action === 'create' ? '/patients' : `/patients/${data.id}`;
          method = item.action === 'create' ? 'POST' : 'PUT';
          break;
        case 'health_record':
          endpoint = data.type === 'physical' 
            ? '/health-records/physical' 
            : '/health-records/advanced';
          method = 'POST';
          break;
        case 'prescription':
          endpoint = '/prescriptions';
          method = 'POST';
          break;
        case 'referral':
          endpoint = '/prescriptions/referrals';
          method = 'POST';
          break;
        default:
          throw new Error(`Unknown sync item type: ${item.type}`);
      }

      // Make API call
      let response;
      switch (method) {
        case 'POST':
          response = await apiService.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiService.put(endpoint, data);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      if (!response.success) {
        throw new Error(response.message || 'API call failed');
      }

      console.log(`Successfully synced ${item.type} ${item.action}:`, response);
    } catch (error) {
      console.error(`Error syncing item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    pendingItems: number;
    lastSyncTime: number | null;
  } {
    const unsyncedData = offlineStorage.getUnsyncedData();
    const pendingItems = Object.keys(unsyncedData).length;
    
    return {
      isOnline: false, // Will be updated by NetInfo listener
      syncInProgress: this.syncInProgress,
      pendingItems,
      lastSyncTime: null, // Could be stored in settings
    };
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<void> {
    console.log('Force sync requested...');
    await this.syncOfflineData();
  }

  /**
   * Clear all offline data (use with caution)
   */
  clearOfflineData(): void {
    console.log('Clearing all offline data...');
    offlineStorage.clearOfflineData();
  }

  /**
   * Get offline data for debugging
   */
  getOfflineData(): Record<string, any> {
    return offlineStorage.getOfflineData();
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
