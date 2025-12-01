const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

/**
 * Cloud Run worker endpoint for competitor scanning
 * TODO: Implement Places API integration for competitor discovery
 */
app.post('/scan', async (req, res) => {
  try {
    const { locationId, radius, keyword } = req.body;

    if (!locationId || !radius) {
      return res.status(400).json({ error: 'locationId and radius required' });
    }

    // TODO: Implement Places API integration
    // 1. Get location coordinates from database
    // 2. Call Places API with nearby search
    // 3. Filter competitors
    // 4. Store competitor snapshots
    // 5. Detect changes from previous snapshots

    res.status(501).json({
      error: 'Not yet implemented',
      todo: 'Implement Places API integration'
    });
  } catch (error) {
    console.error('Competitor scan worker error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'competitor-scan-worker' });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🔍 Competitor scan worker listening on port ${PORT}`);
});
