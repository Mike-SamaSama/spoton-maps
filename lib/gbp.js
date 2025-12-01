const fetch = require('node-fetch');

const BASE_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';

/**
 * List Google Business accounts
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Array>} List of accounts
 */
async function listAccounts(accessToken) {
  const response = await fetch(`${BASE_URL}/accounts`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list accounts: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.accounts || [];
}

/**
 * Create a new business location
 * @param {string} accessToken - OAuth access token
 * @param {string} accountName - Account name (e.g., accounts/123456)
 * @param {object} locationData - Location details
 * @returns {Promise<object>} Created location
 */
async function createLocation(accessToken, accountName, locationData) {
  const response = await fetch(`${BASE_URL}/${accountName}/locations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(locationData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create location: ${error.error?.message || response.statusText}`);
  }

  return await response.json();
}

module.exports = {
  listAccounts,
  createLocation
};
