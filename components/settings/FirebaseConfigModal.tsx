
import React, { useState } from 'react';
import { X, Save, AlertTriangle, HelpCircle, Terminal } from 'lucide-react';
import { FirebaseService } from '../../services/FirebaseService';

interface FirebaseConfigModalProps {
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ onClose }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      let cleanInput = jsonInput;
      if (cleanInput.includes('=')) {
        cleanInput = cleanInput.substring(cleanInput.indexOf('=') + 1);
      }
      if (cleanInput.trim().endsWith(';')) {
        cleanInput = cleanInput.trim().slice(0, -1);
      }

      const config = JSON.parse(cleanInput);
      
      if (!config.apiKey || !config.projectId) {
        throw new Error("Invalid Configuration. Missing apiKey or projectId.");
      }

      FirebaseService.saveConfiguration(config);
    } catch (e) {
      setError("Invalid JSON format. Please ensure you copy the configuration object correctly.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
           <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                 <Terminal size={20} className="text-orange-500" />
                 Setup Cloud Sync
              </h3>
              <p className="text-xs text-gray-500 mt-1">Connect your own Firebase Project</p>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-start gap-3">
                 <HelpCircle size={18} className="shrink-0 mt-0.5" />
                 <div>
                    <p className="font-bold mb-1">How to get your config:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-xs opacity-90">
                       <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline">console.firebase.google.com</a></li>
                       <li>Create a project (or select existing).</li>
                       <li>Add a "Web App" ({`</>`} icon).</li>
                       <li>Copy the <code>firebaseConfig</code> object.</li>
                    </ol>
                 </div>
              </div>
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paste Config JSON</label>
              <textarea 
                value={jsonInput}
                onChange={(e) => { setJsonInput(e.target.value); setError(''); }}
                placeholder={'{\n  "apiKey": "AIza...",\n  "authDomain": "...",\n  "projectId": "..."\n}'}
                className="w-full h-40 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
              {error && (
                 <div className="flex items-center gap-2 text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
                    <AlertTriangle size={14} /> {error}
                 </div>
              )}
           </div>

           <button 
             onClick={handleSave}
             disabled={!jsonInput}
             className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              <Save size={18} /> Save & Restart
           </button>
        </div>

      </div>
    </div>
  );
};
