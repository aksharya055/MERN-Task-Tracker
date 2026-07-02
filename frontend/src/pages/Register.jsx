import React, { useState } from 'react';
import taskService from '../api/taskService';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

const Register = ({ setUser, toggleAuth }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.register(formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Account created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
          <UserPlus size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Join Us</h1>
        <p className="text-slate-400 mb-8 font-medium">Create your private dashboard</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Create Account</button>
        </form>
        <p className="mt-8 text-sm text-slate-400">
          Already have an account?{" "}
          <button onClick={toggleAuth} className="text-indigo-600 font-bold hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;