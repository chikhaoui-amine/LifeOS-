
import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Circle, CheckCircle2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Task, Habit } from '../../types';
import { useTasks } from '../../context/TaskContext';
import { useHabits } from '../../context/HabitContext';

interface DayDetailModalProps {
  date: Date;
  dateKey: string;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ date, dateKey, onClose }) => {
  const { tasks, toggleTask, deleteTask, addTask } = useTasks();
  const { habits, toggleHabit } = useHabits();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Filter Data
  const dayTasks = tasks.filter(t => t.dueDate === dateKey);
  
  const dayHabits = habits.filter(h => {
    if (h.archived) return false;
    // Check if scheduled for this day of week
    const dayIndex = date.getDay();
    const isScheduled = h.frequency.days.includes(dayIndex);
    // Or if already completed on this date (even if not normally scheduled)
    const isCompleted = h.completedDates.includes(dateKey);
    // Only show if created before or on this date
    const isCreated = new Date(h.createdAt).setHours(0,0,0,0) <= date.setHours(0,0,0,0);
    
    return isCreated && (isScheduled || isCompleted);
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    await addTask({
      title: newTaskTitle,
      dueDate: dateKey,
      priority: 'medium',
      category: 'General',
      tags: []
    });
    setNewTaskTitle('');
  };

  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
        deleteTask(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
           <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 {date.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                 {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
             <X size={20} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
           
           {/* Habits Section */}
           {dayHabits.length > 0 && (
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Habits</h3>
                <div className="space-y-2">
                   {dayHabits.map(habit => {
                      const isCompleted = habit.completedDates.includes(dateKey);
                      return (
                         <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3">
                               <span className="text-xl">{habit.icon}</span>
                               <span className={`font-medium text-sm ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                  {habit.name}
                               </span>
                            </div>
                            <button
                               onClick={() => toggleHabit(habit.id, dateKey)}
                               className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? `bg-${habit.color}-500 text-white shadow-md` : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-300'}`}
                            >
                               <Check size={16} strokeWidth={3} />
                            </button>
                         </div>
                      )
                   })}
                </div>
             </div>
           )}

           {/* Tasks Section */}
           <div>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasks</h3>
                 <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">
                    {dayTasks.filter(t => t.completed).length}/{dayTasks.length}
                 </span>
              </div>
              
              <div className="space-y-2">
                 {dayTasks.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                       <p className="text-sm text-gray-400">No tasks for this day.</p>
                    </div>
                 ) : (
                    dayTasks.map(task => (
                       <div key={task.id} className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${task.completed ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-60' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                          <button onClick={() => toggleTask(task.id)} className={`shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-primary-500'}`}>
                             {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                          </button>
                          <div className="flex-1 min-w-0">
                             <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                             </p>
                             {task.dueTime && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                   <Clock size={10} /> {task.dueTime}
                                </p>
                             )}
                          </div>
                          <button onClick={(e) => handleDeleteTask(e, task.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>

        {/* Footer Add Task */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
           <form onSubmit={handleAddTask} className="flex gap-2">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none outline-none focus:ring-2 focus:ring-primary-500/20 text-sm text-gray-900 dark:text-white"
              />
              <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors"
              >
                 <Plus size={20} />
              </button>
           </form>
        </div>

      </div>
    </div>
  );
};
