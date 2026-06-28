import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskForm = ({ isOpen, onClose, onSave, task }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({ ...task, dueDate: task.dueDate.split('T')[0] });
    } else {
      setFormData({ title: '', description: '', priority: 'Medium', status: 'Pending', dueDate: '' });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition"><X /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input type="text" required minLength="3" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
              <select className="w-full p-3 border rounded-xl outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
              <input type="date" required className="w-full p-3 border rounded-xl outline-none" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          </div>
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all mt-4">
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default TaskForm;