const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const rhRoutes = require('./routes/rh');
const financeRoutes = require('./routes/finance');
const schoolRoutes = require('./routes/school');
const { resultatsRouter, certificatsRouter } = require('./routes/documents');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

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

app.listen(port, () => {
  console.log(`SGS Backend running on http://localhost:${port}`);
});
