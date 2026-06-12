const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const rhRoutes = require('./routes/rh');
const financeRoutes = require('./routes/finance');
const schoolRoutes = require('./routes/school');
const { resultatsRouter, certificatsRouter } = require('./routes/documents');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const teacherRoutes = require('./routes/teacher');
const coursesRoutes = require('./routes/courses');
const exercisesRoutes = require('./routes/exercises');
const studentRoutes = require('./routes/student');
const videoRoutes = require('./routes/videos');
const progressRoutes = require('./routes/progress');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/demandes-rh', rhRoutes);
app.use('/api/operations', financeRoutes);
app.use('/api/eleves', schoolRoutes);
app.use('/api/resultats', resultatsRouter);
app.use('/api/certificats', certificatsRouter);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/exercises', exercisesRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api', progressRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

require('./socket')(io);

server.listen(port, () => {
  console.log(`SGS Backend running on http://localhost:${port}`);
});
