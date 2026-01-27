const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const apiRoutes = require('../../routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HubGen API is running on Netlify' });
});

// Export as serverless function
exports.handler = serverless(app);
