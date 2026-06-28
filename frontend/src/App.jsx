import React, { useState, useEffect, useMemo } from 'react';
import taskService from './api/taskService';
import TaskForm from './components/TaskForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, Trash2, Edit3, Calendar, CheckCircle2, Clock, 
  Loader2, ClipboardList, Search, Filter, CheckSquare, 
  Square, AlertCircle, LayoutDashboard, ArrowUpDown 
} from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Search, Filter, and Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks();
      setTasks(res.data);
    } catch (err) {
      toast.error("Database connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, data);
        toast.success("Task updated successfully");
      } else {
        await taskService.createTask(data);
        toast.success("Task created successfully");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTask(task._id, { ...task, status: newStatus });
      toast.info(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (err) { toast.error("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Confirm: Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        toast.warn("Task permanently deleted");
        fetchTasks();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  // Advanced Filtering and Sorting Logic
  const processedTasks = useMemo(() => {
    return tasks
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => filterPriority === 'All' ? true : t.priority === filterPriority)
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'due-date') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortBy === 'alpha') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [tasks, searchTerm, filterPriority, sortBy]);

  // Dashboard Stats Logic
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    high: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
  };

  const isOverdue = (date) => new Date(date) < new Date().setHours(0,0,0,0);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={24}/>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">TaskFlow <span className="text-indigo-600">Pro</span></h1>
          </div>
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 font-bold"
          >
            <Plus size={20} /> New Task
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        
        {/* 1. Dashboard Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Tasks" value={stats.total} icon={<ClipboardList className="text-indigo-600"/>} bg="bg-indigo-50" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="text-amber-600"/>} bg="bg-amber-50" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="text-emerald-600"/>} bg="bg-emerald-50" />
          <StatCard label="High Priority" value={stats.high} icon={<AlertCircle className="text-rose-600"/>} bg="bg-rose-50" />
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select 
              className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select 
              className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="due-date">Due Date</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-slate-500 font-semibold animate-pulse">Fetching your productivity...</p>
          </div>
        ) : processedTasks.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <ClipboardList className="text-slate-400" size={32}/>
            </div>
            <p className="text-slate-500 text-xl font-bold">No tasks found</p>
            <p className="text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedTasks.map(task => (
              <div key={task._id} className={`group bg-white p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 ${task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                    task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                  }`}>
                    {task.priority}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(task._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-4">
                  <button onClick={() => toggleComplete(task)} className="mt-1 transition-transform active:scale-75">
                    {task.status === 'Completed' ? 
                      <CheckSquare className="text-emerald-500" size={22} /> : 
                      <Square className="text-slate-300" size={22} />
                    }
                  </button>
                  <h3 className={`text-lg font-bold leading-tight transition-all ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>
                </div>

                <p className={`text-sm mb-6 line-clamp-2 ${task.status === 'Completed' ? 'text-slate-300' : 'text-slate-500'}`}>
                  {task.description || "No description provided."}
                </p>
                
                <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue(task.dueDate) && task.status !== 'Completed' ? 'text-rose-500' : 'text-slate-400'}`}>
                    <Calendar size={14} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isOverdue(task.dueDate) && task.status !== 'Completed' && <span className="ml-1 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">OVERDUE</span>}
                  </div>
                  
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                    task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm font-medium">TaskFlow Pro © 2026 • Build with MERN Stack</p>
        <p className="text-slate-300 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Developed by Aksharya Lendale</p>
      </footer>

      <TaskForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} task={editingTask} />
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar theme="colored" />
    </div>
  );
}

// Sub-component for Dashboard Stats
const StatCard = ({ label, value, icon, bg }) => (
  <div className={`${bg} p-5 rounded-[1.5rem] border border-white shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
    <div className="bg-white/50 p-2.5 rounded-xl shadow-inner">
      {icon}
    </div>
  </div>
);

export default App;