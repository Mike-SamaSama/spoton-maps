const cron = require('node-cron');
const dotenv = require('dotenv');
const storage = require('./lib/storage');
const refresh = require('./lib/refresh');

dotenv.config();

const SCHEDULE = process.env.SCHEDULE_CRON || '0 3 * * *';

console.log(`🔄 Token Refresh Runner started`);
console.log(`📅 Schedule: ${SCHEDULE}`);

// Scheduled job: refresh all tokens at specified time
cron.schedule(SCHEDULE, async () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Running scheduled token refresh...`);

  try {
    const tokenIds = await storage.listIds();
    console.log(`📊 Found ${tokenIds.length} tokens to refresh`);

    for (const id of tokenIds) {
      try {
        await refresh.refreshTokenById(id);
        console.log(`✅ Refreshed token: ${id}`);
      } catch (error) {
        console.error(`❌ Failed to refresh token ${id}:`, error.message);
      }
    }

    console.log(`✨ Scheduled refresh completed\n`);
  } catch (error) {
    console.error(`❌ Scheduled refresh failed:`, error);
  }
});

// Manual refresh endpoint for testing
const express = require('express');
const app = express();
app.use(express.json());

app.post('/refresh/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await refresh.refreshTokenById(id);
    res.json({ success: true, message: `Token ${id} refreshed` });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'refresh-runner' });
});

const PORT = process.env.REFRESH_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🔄 Refresh manual endpoint available at http://localhost:${PORT}`);
});
