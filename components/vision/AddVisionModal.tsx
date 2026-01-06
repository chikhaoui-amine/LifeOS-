
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Quote, Target, Upload, Link, Search, Sparkles, ArrowRight, Star, Type, PenTool, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useVisionBoard } from '../../context/VisionBoardContext';
import { useGoals } from '../../context/GoalContext';
import { VisionItemType } from '../../types';

interface AddVisionModalProps {
  onClose: () => void;
  centerPos: { x: number, y: number };
}

const COLORS = ['#6366f1', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#eab308', '#ef4444', '#a855f7', '#ffffff', '#000000'];
const FONTS = ['Inter', 'Serif', 'Poppins', 'Mono', 'Georgia', 'Arial Black', 'Cursive', 'Fantasy'];

const STICKER_CATEGORIES = {
  'Favorites': ['Star', 'Heart', 'Zap', 'Flame', 'Cloud', 'Moon', 'Sun', 'Smile', 'Target', 'Trophy', 'Award', 'Crown', 'Diamond', 'Rocket'],
  'Nature': ['Flower', 'Leaf', 'Tree', 'Palmtree', 'Mountain', 'Sunset', 'Wind', 'Droplets', 'Snowflake', 'Bird', 'Cat', 'Dog', 'Fish', 'Rabbit', 'Bug', 'PawPrint'],
  'Objects': ['Key', 'Lock', 'Bell', 'Book', 'Camera', 'Coffee', 'Gift', 'Headphones', 'Map', 'Mic', 'Package', 'Phone', 'Watch', 'Glasses', 'Umbrella', 'Anchor', 'Bomb', 'Compass'],
  'Activities': ['Activity', 'Bike', 'Dumbbell', 'Gamepad', 'Music', 'Plane', 'Ship', 'Car', 'Train', 'Tent', 'Waves', 'Pizza', 'Utensils', 'Wine', 'Beer', 'Briefcase', 'Code', 'Cpu'],
  'Symbols': ['Check', 'X', 'AlertTriangle', 'Info', 'HelpCircle', 'Hash', 'Percent', 'DollarSign', 'Euro', 'Infinity', 'Lightbulb', 'Magnet', 'Flag', 'Shield', 'Ghost', 'Skull']
};

export const AddVisionModal: React.FC<AddVisionModalProps> = ({ onClose, centerPos }) => {
  const { addItem } = useVisionBoard();
  const { goals } = useGoals();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [type, setType] = useState<VisionItemType>('image');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [subContent, setSubContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'link'>('upload');
  const [stickerSearch, setStickerSearch] = useState('');
  const [activeStickerCategory, setActiveStickerCategory] = useState('Favorites');

  const handleSubmit = () => {
    const scatter = (Math.random() * 40) - 20;
    const common = { x: centerPos.x - 150 + scatter, y: centerPos.y - 150 + scatter, zIndex: Date.now() % 100000, rotation: 0, width: '1' as '1', height: '1' as '1', opacity: 1 };

    if (type === 'goal_ref' && selectedGoalId) {
       const goal = goals.find(g => g.id === selectedGoalId);
       if (goal) addItem({ ...common, type: 'goal_ref', content: goal.title, subContent: Math.round((goal.currentValue / goal.targetValue) * 100).toString(), widthPx: 350, heightPx: 180, linkedGoalId: goal.id });
    } else if (content || type === 'image') {
       addItem({
          ...common, type, content, caption: type === 'image' ? caption : undefined, subContent: type === 'quote' ? subContent : undefined,
          widthPx: type === 'sticker' ? 140 : (type === 'affirmation' ? 450 : 320),
          heightPx: type === 'sticker' ? 140 : (type === 'affirmation' ? 180 : 380),
          color: (type === 'quote' || type === 'affirmation' || type === 'sticker') ? selectedColor : undefined,
          fontFamily: (type === 'affirmation' || type === 'quote') ? selectedFont : undefined,
          fontSize: type === 'affirmation' ? 48 : (type === 'quote' ? 24 : undefined),
          textColor: type === 'sticker' ? selectedColor : undefined
       });
    }
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setContent(reader.result as string); setPreviewUrl(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const filteredStickers = stickerSearch 
    ? Object.values(STICKER_CATEGORIES).flat().filter(s => s.toLowerCase().includes(stickerSearch.toLowerCase()))
    : STICKER_CATEGORIES[activeStickerCategory as keyof typeof STICKER_CATEGORIES];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg shadow-2xl border-t sm:border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden max-h-[92vh] rounded-t-[3rem] sm:rounded-[2.5rem]">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
           <div>
              <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tighter">Add Vision</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expansion Pack v2.0</p>
           </div>
           <button onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-full transition-all"><X size={20} /></button>
        </div>

        <div className="flex p-2 bg-gray-100 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 overflow-x-auto custom-scrollbar pb-3 shrink-0">
           {(['image', 'quote', 'affirmation', 'sticker', 'goal_ref'] as const).map(t => (
             <button key={t} onClick={() => { setType(t); if(t === 'affirmation' && !content) setContent('I AM LIMITLESS'); }} className={`px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shrink-0 ${type === t ? 'bg-white dark:bg-gray-700 text-violet-600 shadow-sm' : 'text-gray-400'}`}>
                {t === 'image' && <ImageIcon size={14} />} {t === 'quote' && <Quote size={14} />} {t === 'affirmation' && <Type size={14} />} {t === 'sticker' && <Star size={14} />} {t === 'goal_ref' && <Target size={14} />} {t}
             </button>
           ))}
        </div>

        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 relative bg-white dark:bg-gray-800">
           
           {type === 'image' && (
              <div className="space-y-6 animate-in slide-in-from-right duration-200">
                 <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
                    <button onClick={() => setImageTab('upload')} className={`flex-1 py-2.5 text-[9px] font-black uppercase rounded-xl transition-all ${imageTab === 'upload' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}>Local Storage</button>
                    <button onClick={() => setImageTab('link')} className={`flex-1 py-2.5 text-[9px] font-black uppercase rounded-xl transition-all ${imageTab === 'link' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}>Web Link</button>
                 </div>
                 {imageTab === 'upload' ? (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-12 text-center hover:border-violet-500 hover:bg-violet-50/50 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                       {previewUrl ? <img src={previewUrl} className="max-h-48 mx-auto rounded-2xl shadow-xl" /> : <><Upload size={40} className="mx-auto mb-3 text-gray-300 group-hover:text-violet-500" /><p className="text-xs font-black uppercase text-gray-400">Select Visionary Visual</p></>}
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                 ) : (
                    <input value={content} onChange={e => { setContent(e.target.value); setPreviewUrl(e.target.value); }} placeholder="https://..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-violet-500/20 text-sm font-bold" />
                 )}
                 <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Attach a powerful caption..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-violet-500/20 font-black uppercase tracking-tight" />
              </div>
           )}

           {type === 'sticker' && (
              <div className="space-y-4 animate-in slide-in-from-right duration-200">
                 <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search universe of icons..." value={stickerSearch} onChange={e => setStickerSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-violet-500/20 font-bold" />
                 </div>
                 {!stickerSearch && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3">
                       {Object.keys(STICKER_CATEGORIES).map(cat => (
                          <button key={cat} onClick={() => setActiveStickerCategory(cat)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeStickerCategory === cat ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-900 text-gray-500'}`}>{cat}</button>
                       ))}
                    </div>
                 )}
                 <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {filteredStickers?.map(iconName => {
                       const Icon = (LucideIcons as any)[iconName];
                       return Icon ? (
                          <button key={iconName} onClick={() => setContent(iconName)} className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${content === iconName ? 'bg-violet-600 text-white shadow-2xl scale-110' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-gray-100'}`}><Icon size={28} /></button>
                       ) : null;
                    })}
                 </div>
                 <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Chromatic Profile</label>
                    <div className="flex flex-wrap gap-3">{COLORS.map(c => <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-violet-500 scale-125 shadow-lg' : 'border-white dark:border-gray-700'}`} style={{ background: c }} />)}</div>
                 </div>
              </div>
           )}

           {type === 'quote' && (
              <div className="space-y-6 animate-in slide-in-from-right duration-200">
                 <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Speak truth to your future self..." className="w-full px-8 py-8 rounded-[2.5rem] bg-gray-50 dark:bg-gray-700 text-2xl font-serif italic font-black leading-tight border-none outline-none focus:ring-2 focus:ring-violet-500/20 h-48 resize-none" style={{ color: selectedColor, fontFamily: selectedFont }} />
                 <input value={subContent} onChange={e => setSubContent(e.target.value)} placeholder="Visionary Source" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 font-black uppercase tracking-[0.2em] text-[10px] outline-none" />
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Typeface</label>
                       <select value={selectedFont} onChange={e => setSelectedFont(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-xs font-bold p-3 focus:ring-0">{FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Hue</label>
                       <div className="flex flex-wrap gap-2">{COLORS.slice(0,5).map(c => <button key={c} onClick={() => setSelectedColor(c)} className={`w-6 h-6 rounded-full border ${selectedColor === c ? 'ring-2 ring-violet-500 shadow-sm' : ''}`} style={{ background: c }} />)}</div>
                    </div>
                 </div>
              </div>
           )}

           {type === 'affirmation' && (
              <div className="space-y-6 animate-in slide-in-from-right duration-200">
                 <textarea value={content} onChange={e => setContent(e.target.value.toUpperCase())} className="w-full px-8 py-10 rounded-[3rem] bg-gray-50 dark:bg-gray-700 text-4xl font-black text-center uppercase tracking-tighter leading-none border-none outline-none focus:ring-2 focus:ring-violet-500/20 h-40 resize-none" style={{ fontFamily: selectedFont, color: selectedColor }} />
                 <div className="grid grid-cols-2 gap-8">
                    <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Aesthetic</label><div className="flex flex-wrap gap-2">{COLORS.map(c => <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-violet-500 scale-125' : 'border-white dark:border-gray-700 opacity-50'}`} style={{ background: c }} />)}</div></div>
                    <div><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Identity</label><div className="grid grid-cols-2 gap-1">{FONTS.slice(0,4).map(f => <button key={f} onClick={() => setSelectedFont(f)} className={`py-2 rounded-lg border text-[8px] font-black uppercase ${selectedFont === f ? 'bg-violet-600 text-white' : 'bg-gray-50 dark:bg-gray-900 border-gray-200'}`} style={{ fontFamily: f }}>Aa</button>)}</div></div>
                 </div>
              </div>
           )}

           {type === 'goal_ref' && (
              <div className="space-y-4 animate-in slide-in-from-right duration-200">
                 <div className="space-y-3">
                    {goals.filter(g => g.status !== 'completed').map(g => (
                       <button key={g.id} onClick={() => setSelectedGoalId(g.id)} className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between ${selectedGoalId === g.id ? 'bg-violet-600 border-violet-600 text-white shadow-2xl scale-[1.02]' : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:border-gray-200'}`}>
                          <div>
                             <p className="font-black text-sm uppercase tracking-tight">{g.title}</p>
                             <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${selectedGoalId === g.id ? 'text-white/60' : 'text-gray-400'}`}>{Math.round((g.currentValue/g.targetValue)*100)}% Momentum</p>
                          </div>
                          <div className={`p-2 rounded-xl ${selectedGoalId === g.id ? 'bg-white/20' : 'bg-white dark:bg-gray-800 shadow-sm'}`}><ArrowRight size={18} /></div>
                       </button>
                    ))}
                    {goals.length === 0 && <div className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No active goals to anchor.</div>}
                 </div>
              </div>
           )}
        </div>

        <div className="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 shrink-0 pb-safe">
           <button onClick={handleSubmit} disabled={type === 'goal_ref' ? !selectedGoalId : !content} className="w-full py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"><Check size={20} strokeWidth={4} /> Manifest Logic</button>
        </div>
      </div>
    </div>
  );
};
