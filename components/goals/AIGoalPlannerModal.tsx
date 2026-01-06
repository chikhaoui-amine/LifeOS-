
import { GoogleGenAI, Type } from "@google/genai";
import React, { useState } from 'react';
import { X, Sparkles, BrainCircuit, Loader2, AlertCircle, Target, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Goal } from '../../types';

interface AIGoalPlannerModalProps {
  onGoalGenerated: (goal: Partial<Goal>) => void;
  onClose: () => void;
}

export const AIGoalPlannerModal: React.FC<AIGoalPlannerModalProps> = ({ onGoalGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Architect a world-class strategic roadmap for: "${prompt}". 
        Include:
        1. High-impact Title.
        2. Identity Statement (e.g., "I am a high-performance photographer").
        3. Potential Failure Points (obstacles).
        4. Deep "Why" motivation.
        5. Specific, sequential milestones.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING, description: "Detailed strategy" },
              motivation: { type: Type.STRING, description: "The psychological 'Why'" },
              identityStatement: { type: Type.STRING, description: "Who you must become" },
              category: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
              targetValue: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              obstacles: { type: Type.ARRAY, items: { type: Type.STRING } },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { 
                    title: { type: Type.STRING }, 
                    completed: { type: Type.BOOLEAN } 
                  }
                }
              }
            },
            required: ["title", "description", "motivation", "milestones", "targetValue", "identityStatement"]
          },
          systemInstruction: "You are the LifeOS Executive Strategist. You convert vague user desires into high-performance, structured SMART goals with deep psychological motivations, identity-level shifts, and specific pre-mortems (obstacles) in JSON format."
        },
      });

      if (!response.text) throw new Error("Null response");
      
      const goalData = JSON.parse(response.text);
      const processedGoal = {
        ...goalData,
        id: `ai-${Date.now()}`,
        color: ['indigo', 'blue', 'purple', 'pink', 'amber'][Math.floor(Math.random() * 5)],
        type: 'milestone',
        currentValue: 0,
        description: `${goalData.description}\n\nIDENTITY: ${goalData.identityStatement}\n\nOBSTACLES TO WATCH: ${goalData.obstacles?.join(', ')}`,
        milestones: goalData.milestones?.map((m: any) => ({ 
          ...m, 
          id: `ms-${Math.random().toString(36).substr(2, 7)}` 
        })) || []
      };

      onGoalGenerated(processedGoal);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Strategic consultation interrupted. Verify connectivity.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-500">
      
      <div className="bg-surface rounded-[3rem] w-full max-w-xl shadow-[0_0_150px_rgba(var(--color-primary-rgb),0.2)] border border-foreground/5 overflow-hidden flex flex-col relative">
        
        {/* Background Animation */}
        {isGenerating && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary-600)_0%,transparent_70%)] animate-pulse" />
          </div>
        )}

        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-primary-600 p-10 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-5">
                 <div className={`p-4 rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 ${isGenerating ? 'animate-bounce' : ''}`}>
                    {isGenerating ? <Activity size={32} className="animate-pulse" /> : <BrainCircuit size={32} />}
                 </div>
                 <div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Architect</h2>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Neural Strategy Engine v3.5</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={24} />
              </button>
           </div>
        </div>

        <div className="p-10 space-y-10">
           <div className="space-y-6">
              <div className="flex items-start gap-4 bg-primary-600/5 p-6 rounded-[2rem] border border-primary-600/10">
                 <Zap className="text-primary-600 shrink-0 mt-0.5" size={24} fill="currentColor" />
                 <p className="text-sm font-bold text-foreground opacity-70 leading-relaxed italic font-serif">
                   "Precision is the foundation of progress. Define your vision, and I will calculate the shortest path to total mastery."
                 </p>
              </div>

              <div className="relative group">
                 <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="Describe your deepest ambition..." 
                    className="w-full h-40 p-8 rounded-[2.5rem] bg-foreground/[0.03] border border-foreground/5 outline-none focus:ring-4 focus:ring-primary-600/10 text-lg font-bold text-foreground resize-none transition-all placeholder:text-muted/30" 
                    autoFocus 
                    disabled={isGenerating}
                 />
                 <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-30">
                    <ShieldCheck size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                 </div>
              </div>
           </div>

           {error && (
             <div className="flex items-center gap-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                <span className="font-black uppercase tracking-tight">{error}</span>
             </div>
           )}

           <button 
             onClick={handleGenerate} 
             disabled={isGenerating || !prompt.trim()} 
             className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 overflow-hidden relative group
               ${isGenerating ? 'bg-indigo-600 text-white' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'}
             `}
           >
              {isGenerating ? (
                <>
                  <Loader2 size={24} className="animate-spin" /> 
                  <span className="relative z-10">Synthesizing Path...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} fill="white" className="group-hover:rotate-12 transition-transform" /> 
                  <span className="relative z-10">Consult Strategist</span>
                </>
              )}
           </button>
        </div>
      </div>
    </div>
  );
};
