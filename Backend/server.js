const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();
connectDB();

const app = express();

// ✅ FIXED CORS: This allows your Vercel frontend to communicate with your Render backend
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('🚀 TaskFlow API is Live and Running!'));

const PORT = process.env.PORT || 5000;

// ✅ FIXED LISTEN: Adding '0.0.0.0' is required for many cloud hosting providers like Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is strictly running on port ${PORT}`);
});