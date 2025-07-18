// twitter-auth-api.js - Twitter authentication and Succinct Stats verification backend
// RESTORES and UPDATES previous endpoint to use the new SuccinctStatsAPI class

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const { SuccinctStatsAPI } = require('./succinct-stats-api');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(compression());

// CORS setup (adjust origin as needed)
app.use(cors({
  origin: [
    'https://succinct-gaming-hub.xyz',
    'https://verify.succinct-gaming-hub.xyz',
    'http://localhost:3000',
    'http://localhost:3001'
  ]
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // limit each IP to 60 requests per windowMs
});
app.use(limiter);

// Instantiate the Succinct Stats API
const succinctStats = new SuccinctStatsAPI();

// Example endpoint: Verify Twitter user via Succinct Stats
app.post('/api/verify-twitter', async (req, res) => {
  try {
    const { twitterUsername } = req.body;
    if (!twitterUsername) {
      return res.status(400).json({ error: 'Missing twitterUsername' });
    }

    // Use the new SuccinctStatsAPI class
    const statsResult = await succinctStats.checkTwitterUser(twitterUsername);
    if (statsResult.found) {
      return res.json({ success: true, succinctStats: statsResult.data });
    } else {
      return res.status(404).json({ success: false, error: 'User not found in Succinct Stats' });
    }
  } catch (error) {
    console.error('Error verifying Twitter user:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Twitter Auth API running on port ${PORT}`);
});
