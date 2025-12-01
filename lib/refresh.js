const fetch = require('node-fetch');
const storage = require('./storage');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Refresh an access token using the refresh token
 * @param {string} tokenId - Token ID to refresh
 */
async function refreshTokenById(tokenId) {
  const tokenData = await storage.getTokens(tokenId);

  if (!tokenData) {
    throw new Error(`Token not found: ${tokenId}`);
  }

  if (!tokenData.refresh_token) {
    throw new Error(`No refresh token available for ${tokenId}`);
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(`Failed to refresh token: ${data.error || 'Unknown error'}`);
  }

  // Update stored token with new access token
  const updatedTokenData = {
    ...tokenData,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000)
  };

  await storage.updateTokens(tokenId, updatedTokenData);
  console.log(`✅ Token refreshed: ${tokenId}`);
}

module.exports = {
  refreshTokenById
};
