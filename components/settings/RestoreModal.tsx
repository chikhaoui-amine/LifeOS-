import React, { useState } from 'react';
import { FileJson, RefreshCw, AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { BackupData } from '../../types';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupData: BackupData | null;
  onRestore: (method: 'merge' | 'replace') => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({ 
  isOpen, 
  onClose, 
  backupData, 
  onRestore 
}) => {
  const [method, setMethod] = useState<'merge' | 'replace'>('merge');

  if (!isOpen || !backupData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 flex flex-col items-center border-b border-primary-100 dark:border-primary-800">
           <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 mb-3">
             <FileJson size={24} />
           </div>
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Restore Backup</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
             Created on {new Date(backupData.exportDate).toLocaleDateString()}
           </p>
        </div>

        {/* Content Preview */}
        <div className="p-6">
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{backupData.habits.length}</p>
                 <p className="text-xs text-gray-500 uppercase font-medium">Habits</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl text-center">
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{backupData.tasks.length}</p>
                 <p className="text-xs text-gray-500 uppercase font-medium">Tasks</p>
              </div>
           </div>

           <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Choose Restore Method</h3>
           
           <div className="space-y-3">
              {/* Merge Option */}
              <button 
                onClick={() => setMethod('merge')}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left relative ${method === 'merge' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${method === 'merge' ? 'border-primary-500' : 'border-gray-300'}`}>
                   {method === 'merge' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white text-sm">Merge Data</p>
                   <p className="text-xs text-gray-500 mt-0.5">Add missing items. Existing data is kept safe.</p>
                </div>
              </button>

              {/* Replace Option */}
              <button 
                onClick={() => setMethod('replace')}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left relative ${method === 'replace' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${method === 'replace' ? 'border-red-500' : 'border-gray-300'}`}>
                   {method === 'replace' && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-white text-sm">Replace All</p>
                   <p className="text-xs text-gray-500 mt-0.5">Danger: Wipes current data and replaces it.</p>
                </div>
              </button>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={() => onRestore(method)}
             className={`flex-1 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2
               ${method === 'replace' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'}
             `}
           >
             {method === 'replace' ? <AlertTriangle size={16} /> : <RefreshCw size={16} />}
             Restore
           </button>
        </div>

      </div>
    </div>
  );
};