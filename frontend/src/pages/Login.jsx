import React, { useState } from 'react';
import taskService from '../api/taskService';
import { toast } from 'react-toastify';
import { LogIn, UserPlus } from 'lucide-react';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.login({ email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-indigo-200">
          <LogIn size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Login</h1>
        <p className="text-slate-400 mb-8 font-medium">Access your personal workspace</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Enter Dashboard</button>
        </form>
        <p className="mt-8 text-sm text-slate-400">Don't have an account? <span className="text-indigo-600 font-bold cursor-pointer">Register here</span></p>
      </div>
    </div>
  );
};

export default Login;