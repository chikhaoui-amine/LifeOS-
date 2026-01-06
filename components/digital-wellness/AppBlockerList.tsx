
import React, { useState } from 'react';
import { Globe, Lock, Unlock, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useDigitalWellness } from '../../context/DigitalWellnessContext';
import { BlockedApp } from '../../types';

export const AppBlockerList: React.FC = () => {
  const { blockedApps, addBlockedApp, removeBlockedApp, toggleAppBlock, settings } = useDigitalWellness();
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl && newName) {
      addBlockedApp({
        name: newName,
        url: newUrl,
        category: 'other',
        isBlocked: true
      });
      setNewUrl('');
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <ShieldAlert className="text-red-500" /> Blocked Sites
           </h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Manage distractions & blocked URLs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          disabled={settings.strictMode}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          <Plus size={20} className="text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
           <input 
             placeholder="Site Name (e.g. Facebook)"
             value={newName}
             onChange={e => setNewName(e.target.value)}
             className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
           />
           <input 
             placeholder="URL (e.g. facebook.com)"
             value={newUrl}
             onChange={e => setNewUrl(e.target.value)}
             className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500"
           />
           <div className="flex gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Add Block</button>
           </div>
        </form>
      )}

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {blockedApps.map(app => (
          <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 transition-all group">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${app.isBlocked ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                   <Globe size={18} />
                </div>
                <div>
                   <p className="font-bold text-sm text-gray-900 dark:text-white">{app.name}</p>
                   <p className="text-xs text-gray-500">{app.url}</p>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleAppBlock(app.id)}
                  disabled={settings.strictMode && app.isBlocked} // Cannot unblock during strict mode
                  className={`p-2 rounded-lg transition-colors ${app.isBlocked ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={app.isBlocked ? "Unblock" : "Block"}
                >
                   {app.isBlocked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button 
                  onClick={() => removeBlockedApp(app.id)}
                  disabled={settings.strictMode}
                  className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
                >
                   <Trash2 size={16} />
                </button>
             </div>
          </div>
        ))}
        {blockedApps.length === 0 && (
           <p className="text-center text-gray-400 text-sm py-4">No sites blocked yet.</p>
        )}
      </div>
    </div>
  );
};
