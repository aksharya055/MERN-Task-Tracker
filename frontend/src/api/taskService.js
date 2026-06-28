import axios from 'axios';

// This links your frontend to your backend
const API_URL = 'http://localhost:5000/api/tasks';

export default {
  getTasks: (params) => axios.get(API_URL, { params }),
  createTask: (data) => axios.post(API_URL, data),
  updateTask: (id, data) => axios.put(`${API_URL}/${id}`, data),
  deleteTask: (id) => axios.delete(`${API_URL}/${id}`),
};