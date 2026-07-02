import React, { useState, useEffect, useMemo } from 'react';
import taskService from './api/taskService';
import TaskForm from './components/TaskForm';
import Login from './pages/Login';
import Register from './pages/Register'; // Make sure this file exists!
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, Trash2, Edit3, Calendar, CheckCircle2, Clock, 
  Loader2, Search, Filter, CheckSquare, Square, 
  AlertCircle, LayoutDashboard, LogOut, ClipboardList
} from 'lucide-react';

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isRegistering, setIsRegistering] = useState(false);

  // --- TASK STATE ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- FILTER/SORT STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch tasks only if user is logged in
  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks();
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else toast.error("Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
    toast.info("Logged out successfully");
  };

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, data);
        toast.success("Task updated");
      } else {
        await taskService.createTask(data);
        toast.success("Task created");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTask(task._id, { ...task, status: newStatus });
      fetchTasks();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        toast.warn("Task deleted");
        fetchTasks();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  // --- DASHBOARD LOGIC (Stats & Filtering) ---
  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    high: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
  }), [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(t => filterPriority === 'All' ? true : t.priority === filterPriority)
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'due-date') return new Date(a.dueDate) - new Date(b.dueDate);
        return a.title.localeCompare(b.title);
      });
  }, [tasks, searchTerm, filterPriority, sortBy]);

  // --- CONDITIONAL RENDERING (Auth vs Dashboard) ---
  if (!user) {
    return (
      <>
        {isRegistering ? (
          <Register setUser={setUser} toggleAuth={() => setIsRegistering(false)} />
        ) : (
          <Login setUser={setUser} toggleAuth={() => setIsRegistering(true)} />
        )}
        <ToastContainer position="top-center" autoClose={2000} theme="colored" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 h-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
            <LayoutDashboard size={24}/>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">TaskFlow <span className="text-indigo-600">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome back</span>
            <span className="text-sm font-black text-slate-700 leading-none">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
            <LogOut size={20}/>
          </button>
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl transition-all active:scale-95 font-bold"
          >
            <Plus size={20} /> <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {/* --- 1. STATISTICS CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total" value={stats.total} icon={<ClipboardList className="text-indigo-600"/>} bg="bg-indigo-50" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="text-amber-600"/>} bg="bg-amber-50" />
          <StatCard label="Done" value={stats.completed} icon={<CheckCircle2 className="text-emerald-600"/>} bg="bg-emerald-50" />
          <StatCard label="Urgent" value={stats.high} icon={<AlertCircle className="text-rose-600"/>} bg="bg-rose-50" />
        </div>

        {/* --- 2. SEARCH & FILTERS --- */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
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
              <option value="newest">Newest</option>
              <option value="due-date">Due Date</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
        </div>

        {/* --- 3. TASK GRID --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-slate-400 font-bold animate-pulse uppercase tracking-tighter">Syncing Cloud...</p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <ClipboardList size={32}/>
            </div>
            <p className="text-slate-500 text-xl font-bold">Workspace is empty</p>
            <p className="text-slate-400 mt-1">Ready to start something new?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedTasks.map(task => (
              <div key={task._id} className={`group bg-white p-7 rounded-[2.5rem] border transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 ${task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.priority === 'High' ? 'bg-rose-100 text-rose-600' : 
                      task.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingTask(task); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(task._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <button onClick={() => toggleComplete(task)} className="mt-1 transition-transform active:scale-75">
                      {task.status === 'Completed' ? 
                        <CheckSquare className="text-emerald-500" size={24} /> : 
                        <Square className="text-slate-300" size={24} />
                      }
                    </button>
                    <h3 className={`text-xl font-bold leading-tight transition-all ${task.status === 'Completed' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </h3>
                  </div>

                  <p className={`text-sm mb-8 line-clamp-3 leading-relaxed ${task.status === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>
                    {task.description || "No details provided."}
                  </p>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${task.status === 'Completed' ? 'text-slate-200' : 'text-slate-400'}`}>
                      <Calendar size={14} />
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
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

      <footer className="mt-20 py-10 border-t border-slate-200 text-center bg-white/50">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">TaskFlow Pro • Version 2.0</p>
        <p className="text-slate-300 text-xs mt-2 font-medium">Developed by Aksharya Lendale for Professional Portfolio</p>
      </footer>

      <TaskForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} task={editingTask} />
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar theme="colored" />
    </div>
  );
}

// Reusable Stat Card Component
const StatCard = ({ label, value, icon, bg }) => (
  <div className={`${bg} p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]`}>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
    <div className="bg-white/60 p-3 rounded-2xl shadow-inner">
      {React.cloneElement(icon, { size: 24 })}
    </div>
  </div>
);

export default App;