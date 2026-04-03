require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const recordRoutes = require('./routes/records');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/records', recordRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Basic route
app.get('/api', (req, res) => res.json({ msg: 'EduFlow AI Backend API is running' }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const rootPath = path.join(__dirname, '../dist');
  app.use(express.static(rootPath));
  
  app.use((req, res) => {
    res.sendFile(path.resolve(rootPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
