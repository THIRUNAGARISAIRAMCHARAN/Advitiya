const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const db = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Limit auth endpoints to 10 requests per 15 minutes
    message: { error: 'Too many authentication attempts, please try again later.' }
});

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HubGen API is running' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all handler for SPA support
app.use((req, res, next) => {
    // If request starts with /api, it's a 404 for API
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'Not Found' });
    }
    // Otherwise serve index.html
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
