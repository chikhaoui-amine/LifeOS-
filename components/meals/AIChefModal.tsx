
import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Loader2, AlertCircle } from 'lucide-react';
import { AIService } from '../../services/AIService';
import { Recipe } from '../../types';

interface AIChefModalProps {
  onRecipeGenerated: (recipe: Partial<Recipe>) => void;
  onClose: () => void;
}

export const AIChefModal: React.FC<AIChefModalProps> = ({ onRecipeGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const response = await AIService.generateResponse({
        model: 'gemini-3-flash-preview',
        prompt: `Create a professional recipe in JSON format based on: "${prompt}".`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a gourmet chef. Generate a delicious, easy-to-follow recipe in valid JSON format. Match the language of the prompt.",
        }
      });

      // Defensive parsing for the text output
      let cleanJson = response.text || '';
      if (cleanJson.includes('```')) {
         cleanJson = cleanJson.replace(/```json|```/g, '').trim();
      }

      const recipeData = JSON.parse(cleanJson || '{}');
      const processedRecipe = {
        ...recipeData,
        ingredients: recipeData.ingredients?.map((ing: any) => ({
          ...ing,
          id: Math.random().toString(36).substr(2, 9),
          category: 'Other'
        })) || []
      };

      onRecipeGenerated(processedRecipe);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("AI Service busy or unreachable. Ensure backend is deployed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
           <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><ChefHat size={24} /></div>
                 <div><h2 className="text-xl font-bold">AI Chef</h2><p className="text-orange-100 text-xs font-medium">Server-side Intelligence</p></div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full"><X size={18} /></button>
           </div>
        </div>
        <div className="p-6 space-y-6">
           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g. A high-protein Mediterranean lunch under 20 mins..." className="w-full h-32 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-gray-900 dark:text-white" autoFocus />
           {error && <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl"><AlertCircle size={16} /> {error}</div>}
           <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Cooking...</> : <><Sparkles size={20} /> Generate Recipe</>}
           </button>
        </div>
      </div>
    </div>
  );
};
