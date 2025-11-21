// Migration Helper - localStorage to Firestore
import { createUserProfile, updateUserProfile } from '../services/firestoreService';

interface LocalStorageUser {
  uid: string;
  email: string;
  displayName: string;
}

interface LocalStorageData {
  user?: LocalStorageUser;
  stats?: any;
  sessions?: any[];
  notebook?: any[];
}

/**
 * Check if user has data in localStorage
 */
export const hasLocalStorageData = (): boolean => {
  try {
    const userData = localStorage.getItem('user');
    return !!userData;
  } catch (error) {
    console.error('Error checking localStorage:', error);
    return false;
  }
};

/**
 * Get all data from localStorage
 */
export const getLocalStorageData = (): LocalStorageData | null => {
  try {
    const user = localStorage.getItem('user');
    const stats = localStorage.getItem('stats');
    const sessions = localStorage.getItem('sessions');
    const notebook = localStorage.getItem('notebook');

    return {
      user: user ? JSON.parse(user) : undefined,
      stats: stats ? JSON.parse(stats) : undefined,
      sessions: sessions ? JSON.parse(sessions) : undefined,
      notebook: notebook ? JSON.parse(notebook) : undefined,
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return null;
  }
};

/**
 * Migrate user data from localStorage to Firestore
 */
export const migrateLocalStorageToFirestore = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const localData = getLocalStorageData();

    if (!localData || !localData.user) {
      return { success: true }; // No data to migrate
    }

    // Prepare user profile data
    const profileData = {
      uid: userId,
      email: localData.user.email,
      displayName: localData.user.displayName,
      stats: localData.stats,
      sessions: localData.sessions || [],
      notebook: localData.notebook || [],
    };

    // Create or update user profile in Firestore
    const result = await updateUserProfile(userId, profileData);

    if (result.success) {
      console.log('✅ Successfully migrated data to Firestore');
      // Optional: Clear localStorage after successful migration
      // clearLocalStorageData();
      return { success: true };
    } else {
      console.error('Failed to migrate data:', result.error);
      return { success: false, error: 'Migration failed' };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: 'Unexpected error during migration' };
  }
};

/**
 * Clear localStorage data
 */
export const clearLocalStorageData = (): void => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('stats');
    localStorage.removeItem('sessions');
    localStorage.removeItem('notebook');
    console.log('LocalStorage data cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Fallback to localStorage if Firestore is unavailable
 */
export const getFallbackData = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting fallback data for ${key}:`, error);
    return null;
  }
};

/**
 * Save fallback data to localStorage
 */
export const saveFallbackData = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving fallback data for ${key}:`, error);
    return false;
  }
};

/**
 * Check sync status between localStorage and Firestore
 */
export const checkSyncStatus = async (userId: string, localData: any): Promise<{
  isSynced: boolean;
  lastSyncTime?: number;
}> => {
  try {
    const lastSync = localStorage.getItem(`lastSync_${userId}`);
    const lastSyncTime = lastSync ? parseInt(lastSync, 10) : 0;
    const now = Date.now();
    const syncThreshold = 5 * 60 * 1000; // 5 minutes

    return {
      isSynced: now - lastSyncTime < syncThreshold,
      lastSyncTime,
    };
  } catch (error) {
    console.error('Error checking sync status:', error);
    return { isSynced: false };
  }
};

/**
 * Update sync timestamp
 */
export const updateSyncTimestamp = (userId: string): void => {
  try {
    localStorage.setItem(`lastSync_${userId}`, Date.now().toString());
  } catch (error) {
    console.error('Error updating sync timestamp:', error);
  }
};
