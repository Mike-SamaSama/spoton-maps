const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Encrypt a string using AES-256-GCM
 * @param {string} plaintext - Text to encrypt
 * @param {string} key - 32-byte hex key
 * @returns {string} IV+AuthTag+Ciphertext as base64
 */
function encryptString(plaintext, key) {
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
  return combined.toString('base64');
}

/**
 * Decrypt a string encrypted with encryptString
 * @param {string} encrypted - Base64 encrypted data
 * @param {string} key - 32-byte hex key
 * @returns {string} Decrypted plaintext
 */
function decryptString(encrypted, key) {
  const keyBuffer = Buffer.from(key, 'hex');
  const combined = Buffer.from(encrypted, 'base64');

  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt an object (JSON)
 * @param {object} obj - Object to encrypt
 * @param {string} key - 32-byte hex key
 * @returns {string} Encrypted JSON string
 */
function encryptObject(obj, key) {
  return encryptString(JSON.stringify(obj), key);
}

/**
 * Decrypt an object (JSON)
 * @param {string} encrypted - Base64 encrypted data
 * @param {string} key - 32-byte hex key
 * @returns {object} Decrypted object
 */
function decryptObject(encrypted, key) {
  const plaintext = decryptString(encrypted, key);
  return JSON.parse(plaintext);
}

module.exports = {
  encryptString,
  decryptString,
  encryptObject,
  decryptObject
};
