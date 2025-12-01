const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const storage = require('./lib/storage');
const refresh = require('./lib/refresh');
const gbp = require('./lib/gbp');
const cloudTasks = require('./lib/cloudtasks');

dotenv.config();

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OAuth Start: Redirect to Google
app.get('/auth/start', (req, res) => {
  const state = uuidv4();
  const scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/business.manage'
  ].join(' ');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.append('client_id', CLIENT_ID);
  url.searchParams.append('redirect_uri', REDIRECT_URI);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', scope);
  url.searchParams.append('state', state);
  url.searchParams.append('access_type', 'offline');
  url.searchParams.append('prompt', 'consent');

  res.redirect(url.toString());
});

// OAuth Callback: Exchange code for tokens
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).render('authorized', {
        success: false,
        error: `OAuth error: ${error}`,
        tokenId: null
      });
    }

    if (!code) {
      return res.status(400).render('authorized', {
        success: false,
        error: 'No authorization code received',
        tokenId: null
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to obtain access token');
    }

    // Generate unique token ID
    const tokenId = uuidv4();

    // Save encrypted tokens
    const tokenPayload = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      created_at: new Date().toISOString()
    };

    await storage.saveTokens(tokenId, tokenPayload);

    res.render('authorized', {
      success: true,
      tokenId,
      error: null
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).render('authorized', {
      success: false,
      error: error.message,
      tokenId: null
    });
  }
});

// List Google Business Accounts
app.get('/accounts', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token ID required' });
    }

    const tokenData = await storage.getTokens(token);
    if (!tokenData) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const accounts = await gbp.listAccounts(tokenData.access_token);
    res.json(accounts);
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new location
app.post('/create-location', async (req, res) => {
  try {
    const { tokenId, accountName, locationData } = req.body;

    if (!tokenId || !accountName || !locationData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tokenData = await storage.getTokens(tokenId);
    if (!tokenData) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const result = await gbp.createLocation(
      tokenData.access_token,
      accountName,
      locationData
    );

    res.json({ success: true, location: result });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual token refresh endpoint
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

// Enqueue refresh task to Cloud Tasks
app.post('/enqueue-refresh', async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: 'Token ID required' });
    }

    // Check if Cloud Tasks is configured
    if (!process.env.CLOUD_TASKS_QUEUE) {
      return res.status(400).json({
        error: 'Cloud Tasks not configured. Use /refresh/:id for local testing.'
      });
    }

    await cloudTasks.createHttpTask(`/refresh`, { id: tokenId });
    res.json({ success: true, message: `Refresh task enqueued for ${tokenId}` });
  } catch (error) {
    console.error('Error enqueueing refresh task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Homepage
app.get('/', (req, res) => {
  res.render('index', { authStartUrl: '/auth/start' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 OAuth callback: ${REDIRECT_URI}`);
});
