const fs = require('fs').promises;
const path = require('path');
const crypto = require('./crypto');

const STORAGE_BACKEND = process.env.STORAGE_BACKEND || 'file';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const DATA_FILE = path.join(__dirname, '../data/data.json');

let pgClient;
let prismaClient;

// Initialize backend-specific clients
async function initBackend() {
  if (STORAGE_BACKEND === 'postgres' && !pgClient) {
    const { Client } = require('pg');
    pgClient = new Client(process.env.DATABASE_URL);
    await pgClient.connect();
    console.log('✅ PostgreSQL connected');
  } else if (STORAGE_BACKEND === 'prisma' && !prismaClient) {
    const prisma = require('./prisma');
    prismaClient = prisma.getPrisma();
    console.log('✅ Prisma connected');
  }
}

/**
 * Encrypt payload if key is configured
 */
function encryptPayload(data) {
  if (!ENCRYPTION_KEY) return JSON.stringify(data);
  return crypto.encryptObject(data, ENCRYPTION_KEY);
}

/**
 * Decrypt payload if key is configured
 */
function decryptPayload(encrypted) {
  if (!ENCRYPTION_KEY) return JSON.parse(encrypted);
  return crypto.decryptObject(encrypted, ENCRYPTION_KEY);
}

/**
 * Save tokens to storage
 */
async function saveTokens(tokenId, tokenData) {
  await initBackend();

  if (STORAGE_BACKEND === 'file') {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });

    let data = {};
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    } catch (e) {
      // File doesn't exist yet
    }

    data[tokenId] = encryptPayload(tokenData);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } else if (STORAGE_BACKEND === 'postgres') {
    const encrypted = encryptPayload(tokenData);
    await pgClient.query(
      'INSERT INTO tokens (id, encrypted_data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET encrypted_data = $2',
      [tokenId, encrypted]
    );
  } else if (STORAGE_BACKEND === 'prisma') {
    const encrypted = encryptPayload(tokenData);
    await prismaClient.token.upsert({
      where: { id: tokenId },
      update: { encrypted },
      create: { id: tokenId, encrypted, tenantId: 'default-tenant' }
    });
  }
}

/**
 * Get tokens from storage
 */
async function getTokens(tokenId) {
  await initBackend();

  if (STORAGE_BACKEND === 'file') {
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      if (data[tokenId]) {
        return decryptPayload(data[tokenId]);
      }
    } catch (e) {
      return null;
    }
  } else if (STORAGE_BACKEND === 'postgres') {
    const result = await pgClient.query('SELECT encrypted_data FROM tokens WHERE id = $1', [tokenId]);
    if (result.rows.length > 0) {
      return decryptPayload(result.rows[0].encrypted_data);
    }
  } else if (STORAGE_BACKEND === 'prisma') {
    const token = await prismaClient.token.findUnique({ where: { id: tokenId } });
    if (token) {
      return decryptPayload(token.encrypted);
    }
  }

  return null;
}

/**
 * Update tokens in storage
 */
async function updateTokens(tokenId, tokenData) {
  await saveTokens(tokenId, tokenData);
}

/**
 * List all token IDs
 */
async function listIds() {
  await initBackend();

  if (STORAGE_BACKEND === 'file') {
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      return Object.keys(data);
    } catch (e) {
      return [];
    }
  } else if (STORAGE_BACKEND === 'postgres') {
    const result = await pgClient.query('SELECT id FROM tokens');
    return result.rows.map(row => row.id);
  } else if (STORAGE_BACKEND === 'prisma') {
    const tokens = await prismaClient.token.findMany({ select: { id: true } });
    return tokens.map(t => t.id);
  }

  return [];
}

module.exports = {
  saveTokens,
  getTokens,
  updateTokens,
  listIds,
  initBackend
};
