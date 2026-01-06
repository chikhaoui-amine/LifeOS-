
import React from 'react';
import { X, Calendar, Clock, Tag, Flag, CheckCircle2, Circle, Edit2, Trash2, ListChecks } from 'lucide-react';
import { Task } from '../types';
import { getRelativeTime } from '../utils/dateUtils';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSubtask: (subtaskId: string) => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ 
  task, 
  onClose, 
  onToggle, 
  onEdit, 
  onDelete,
  onToggleSubtask
}) => {
  const priorityColor = 
    task.priority === 'high' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' : 
    task.priority === 'medium' ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' : 
    'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
           <div className="flex items-center gap-2">
             <button onClick={onToggle} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${task.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-white border border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
                {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                {task.completed ? 'Completed' : 'Mark Complete'}
             </button>
           </div>
           <div className="flex items-center gap-1">
             <button onClick={onEdit} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
               <Edit2 size={18} />
             </button>
             <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
               <Trash2 size={18} />
             </button>
             <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-2">
               <X size={20} />
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           
           {/* Metadata Chips */}
           <div className="flex flex-wrap gap-2 mb-6">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${priorityColor}`}>
                 <Flag size={12} fill="currentColor" />
                 {task.priority} Priority
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                 {task.category}
              </span>
           </div>

           <h2 className={`text-2xl font-bold text-gray-900 dark:text-white mb-4 ${task.completed ? 'line-through text-gray-400' : ''}`}>
             {task.title}
           </h2>

           {task.description && (
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 whitespace-pre-wrap">
               {task.description}
             </p>
           )}

           <div className="space-y-6">
              {/* Due Date & Time */}
              <div className="flex items-start gap-4">
                 <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-400">
                   <Calendar size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Due Date</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                       {task.dueDate ? (
                         <>
                           <span>{new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                           {task.dueTime && (
                              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                 <Clock size={12} /> {task.dueTime}
                              </span>
                           )}
                           <span className="mx-1.5 opacity-50">•</span>
                           <span>{getRelativeTime(task.dueDate)}</span>
                         </>
                       ) : 'No due date'}
                    </p>
                 </div>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-400">
                    <Tag size={20} />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</p>
                     <div className="flex flex-wrap gap-2">
                        {task.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                            #{tag}
                          </span>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                 <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ListChecks size={18} className="text-primary-500" /> Subtasks
                      </h3>
                      <span className="text-xs font-medium text-gray-500">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                       <div 
                         className="h-full bg-primary-500 transition-all duration-300"
                         style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                       />
                    </div>

                    <div className="space-y-3">
                       {task.subtasks.map(st => (
                         <button 
                           key={st.id}
                           onClick={() => onToggleSubtask(st.id)}
                           className="flex items-start gap-3 w-full text-left group"
                         >
                           <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${st.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent group-hover:border-primary-500'}`}>
                              <CheckCircle2 size={12} />
                           </div>
                           <span className={`text-sm ${st.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                             {st.title}
                           </span>
                         </button>
                       ))}
                    </div>
                 </div>
              )}
           </div>

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-xs text-center text-gray-400">
           Created {new Date(task.createdAt).toLocaleDateString()}
        </div>

      </div>
    </div>
  );
};
