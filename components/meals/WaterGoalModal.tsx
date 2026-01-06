
import React, { useState } from 'react';
import { X, Droplets, Target, Save, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface WaterGoalModalProps {
  currentIntake: number;
  currentGoal: number;
  onSave: (intake: number, goal: number) => void;
  onClose: () => void;
}

export const WaterGoalModal: React.FC<WaterGoalModalProps> = ({ currentIntake, currentGoal, onSave, onClose }) => {
  const [intake, setIntake] = useState(currentIntake.toString());
  const [goal, setGoal] = useState(currentGoal.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intakeNum = parseInt(intake);
    const goalNum = parseInt(goal);
    if (!isNaN(intakeNum) && !isNaN(goalNum)) {
      onSave(intakeNum, goalNum);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Droplets size={20} className="text-blue-500" />
              Hydration Goals
           </h3>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
           <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Current Intake (Glasses)</label>
                 <div className="relative">
                    <input 
                      type="number"
                      value={intake}
                      onChange={e => setIntake(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-none text-2xl font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Today</span>
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Daily Target (Goal)</label>
                 <div className="relative">
                    <input 
                      type="number"
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-none text-2xl font-black text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <Target size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500/50" />
                 </div>
              </div>
           </div>

           <button 
             type="submit" 
             className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              <Check size={18} strokeWidth={3} /> Save Hydration
           </button>
        </form>

      </div>
    </div>
  );
};
