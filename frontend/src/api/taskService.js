import axios from 'axios';

// THIS IS THE KEY: It must point to your RENDER URL, not localhost
const API_URL = 'https://mern-task-tracker-mx55.onrender.com/api';

const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: { Authorization: `Bearer ${user?.token}` }
  };
};

export default {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  getTasks: () => axios.get(`${API_URL}/tasks`, getAuthConfig()),
  createTask: (data) => axios.post(`${API_URL}/tasks`, data, getAuthConfig()),
  updateTask: (id, data) => axios.put(`${API_URL}/tasks/${id}`, data, getAuthConfig()),
  deleteTask: (id) => axios.delete(`${API_URL}/tasks/${id}`, getAuthConfig()),
};