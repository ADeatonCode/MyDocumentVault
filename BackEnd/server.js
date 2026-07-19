// This file starts the web server for the document vault.
// It connects the database, handles web requests, and serves the website.
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Load the helper files that run the login system and document actions.
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Connect to the database when the server starts.
connectDB();

// Let visitors download uploaded files and show the website pages.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'FrontEnd', 'public')));

// A simple health check so we can tell the server is awake.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'MyDocumentVault API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'FrontEnd', 'public', 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
