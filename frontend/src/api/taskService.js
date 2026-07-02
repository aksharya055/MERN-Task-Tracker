import axios from 'axios';

const API_URL = "https://mern-task-tracker-aksharya.onrender.com/api";

// Helper to get token from local storage
const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: { Authorization: `Bearer ${user?.token}` }
  };
};

export default {
  // Auth API
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),

  // Tasks API (Sending token with every request)
  getTasks: () => axios.get(`${API_URL}/tasks`, getAuthConfig()),
  createTask: (data) => axios.post(`${API_URL}/tasks`, data, getAuthConfig()),
  updateTask: (id, data) => axios.put(`${API_URL}/tasks/${id}`, data, getAuthConfig()),
  deleteTask: (id) => axios.delete(`${API_URL}/tasks/${id}`, getAuthConfig()),
};