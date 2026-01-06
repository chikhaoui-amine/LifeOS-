import React from 'react';
import { Target, TrendingUp, BookOpen, Briefcase, Heart, Plane, Home, Smile, X } from 'lucide-react';
import { Goal } from '../../types';

interface GoalTemplatesProps {
  onSelect: (template: Partial<Goal>) => void;
  onClose: () => void;
}

const TEMPLATES = [
  {
    title: "Save $10,000",
    category: "Financial & Wealth",
    icon: TrendingUp,
    description: "Build an emergency fund or save for a big purchase.",
    type: "numeric",
    targetValue: 10000,
    unit: "$",
    color: "green",
    motivation: "Financial freedom starts with savings."
  },
  {
    title: "Run a Marathon",
    category: "Health & Fitness",
    icon: Heart,
    description: "Train for and complete a 42km run.",
    type: "milestone",
    targetValue: 100,
    milestones: [
       { id: '1', title: 'Run 5k', completed: false },
       { id: '2', title: 'Run 10k', completed: false },
       { id: '3', title: 'Run Half Marathon', completed: false },
       { id: '4', title: 'Complete Marathon', completed: false },
    ],
    color: "red",
    motivation: "Push my physical limits."
  },
  {
    title: "Read 12 Books",
    category: "Personal Development",
    icon: BookOpen,
    description: "Read one book every month this year.",
    type: "numeric",
    targetValue: 12,
    unit: "books",
    color: "blue",
    motivation: "Knowledge is power."
  },
  {
    title: "Start a Business",
    category: "Career & Business",
    icon: Briefcase,
    description: "Launch a side hustle or startup.",
    type: "milestone",
    targetValue: 100,
    milestones: [
       { id: '1', title: 'Validate Idea', completed: false },
       { id: '2', title: 'Create Business Plan', completed: false },
       { id: '3', title: 'Register Business', completed: false },
       { id: '4', title: 'Launch MVP', completed: false },
    ],
    color: "indigo",
    motivation: "Be my own boss."
  },
  {
    title: "Learn a New Language",
    category: "Education & Learning",
    icon: Smile,
    description: "Achieve conversational fluency.",
    type: "habit",
    targetValue: 100,
    unit: "%",
    color: "amber",
    motivation: "Connect with more people."
  },
  {
    title: "Visit 3 New Countries",
    category: "Adventure & Travel",
    icon: Plane,
    description: "Explore the world and see new places.",
    type: "numeric",
    targetValue: 3,
    unit: "countries",
    color: "purple",
    motivation: "Adventure awaits."
  },
];

export const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose a Template</h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Start with a pre-configured goal structure.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {TEMPLATES.map((t, i) => (
             <button 
               key={i}
               onClick={() => onSelect(t as Partial<Goal>)}
               className="flex flex-col text-left bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg rounded-2xl p-5 transition-all group"
             >
                <div className={`w-10 h-10 rounded-xl bg-${t.color}-100 dark:bg-${t.color}-900/30 text-${t.color}-600 dark:text-${t.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                   <t.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t.title}</h3>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">{t.category}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{t.description}</p>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};