const express = require('express');
const dotenv = require('dotenv');
const refresh = require('../lib/refresh');

dotenv.config();

const app = express();
app.use(express.json());

const TASK_SECRET = process.env.TASK_SECRET;

/**
 * Cloud Run worker endpoint for token refresh
 * Accepts POST requests with { id: 'token-id' }
 */
app.post('/refresh', async (req, res) => {
  try {
    const { id } = req.body;
    const authorization = req.headers.authorization;

    // Validate OIDC token for production, or TASK_SECRET for local testing
    if (TASK_SECRET && authorization) {
      const token = authorization.replace('Bearer ', '');
      if (token !== TASK_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    if (!id) {
      return res.status(400).json({ error: 'Token ID required' });
    }

    await refresh.refreshTokenById(id);
    res.json({ success: true, message: `Token ${id} refreshed` });
  } catch (error) {
    console.error('Refresh worker error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'refresh-worker' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔄 Refresh worker listening on port ${PORT}`);
});
