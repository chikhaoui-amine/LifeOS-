
import { BackupData } from '../types';

/**
 * Mock Google Drive Service for LifeOS.
 * In a production app, this would use gapi/gis client libraries.
 */

const CLOUD_STORAGE_MOCK_KEY = 'lifeos_mock_google_drive';
const MASTER_SYNC_FILENAME = 'lifeos_sync_master.json';

export interface GoogleDriveFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  data: BackupData;
}

export const GoogleDriveService = {
  isSignedIn: false,

  signIn: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        GoogleDriveService.isSignedIn = true;
        // In mock, we persist the sign-in state in session storage
        sessionStorage.setItem('lifeos_mock_auth', 'true');
        resolve(true);
      }, 800);
    });
  },

  signOut: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        GoogleDriveService.isSignedIn = false;
        sessionStorage.removeItem('lifeos_mock_auth');
        resolve();
      }, 300);
    });
  },

  // Real-time Master Sync logic
  saveMasterSync: async (data: BackupData): Promise<void> => {
    if (!GoogleDriveService.isSignedIn) return;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const cloudFiles = JSON.parse(localStorage.getItem(CLOUD_STORAGE_MOCK_KEY) || '[]');
        const updatedFiles = cloudFiles.filter((f: any) => f.name !== MASTER_SYNC_FILENAME);
        
        const masterFile: GoogleDriveFile = {
          id: 'master_sync_id',
          name: MASTER_SYNC_FILENAME,
          createdTime: new Date().toISOString(),
          size: (JSON.stringify(data).length / 1024).toFixed(1) + ' KB',
          data: data
        };
        
        localStorage.setItem(CLOUD_STORAGE_MOCK_KEY, JSON.stringify([masterFile, ...updatedFiles]));
        resolve();
      }, 1000); // Simulate network latency
    });
  },

  getLatestMasterSync: async (): Promise<BackupData | null> => {
    if (!GoogleDriveService.isSignedIn) return null;

    return new Promise((resolve) => {
      setTimeout(() => {
        const cloudFiles = JSON.parse(localStorage.getItem(CLOUD_STORAGE_MOCK_KEY) || '[]');
        const masterFile = cloudFiles.find((f: any) => f.name === MASTER_SYNC_FILENAME);
        resolve(masterFile ? masterFile.data : null);
      }, 800);
    });
  },

  uploadBackup: async (data: BackupData): Promise<string> => {
    if (!GoogleDriveService.isSignedIn) throw new Error("Not signed in");
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const backups = JSON.parse(localStorage.getItem(CLOUD_STORAGE_MOCK_KEY) || '[]');
        const newFile: GoogleDriveFile = {
          id: 'drive_file_' + Date.now(),
          name: `LifeOS_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`,
          createdTime: new Date().toISOString(),
          size: (JSON.stringify(data).length / 1024).toFixed(1) + ' KB',
          data: data
        };
        
        const updated = [newFile, ...backups].slice(0, 10);
        localStorage.setItem(CLOUD_STORAGE_MOCK_KEY, JSON.stringify(updated));
        
        resolve(newFile.id);
      }, 1200);
    });
  },

  listFiles: async (): Promise<GoogleDriveFile[]> => {
    if (!GoogleDriveService.isSignedIn) throw new Error("Not signed in");
    return new Promise((resolve) => {
      setTimeout(() => {
        const backups = JSON.parse(localStorage.getItem(CLOUD_STORAGE_MOCK_KEY) || '[]');
        // Filter out master sync from manual backup list to avoid confusion
        resolve(backups.filter((f: any) => f.name !== MASTER_SYNC_FILENAME));
      }, 500);
    });
  },

  downloadFile: async (fileId: string): Promise<BackupData> => {
     if (!GoogleDriveService.isSignedIn) throw new Error("Not signed in");
     
     return new Promise((resolve, reject) => {
        setTimeout(() => {
           const backups = JSON.parse(localStorage.getItem(CLOUD_STORAGE_MOCK_KEY) || '[]') as GoogleDriveFile[];
           const file = backups.find(f => f.id === fileId);
           if (file) resolve(file.data);
           else reject(new Error("File not found"));
        }, 800);
     });
  }
};
