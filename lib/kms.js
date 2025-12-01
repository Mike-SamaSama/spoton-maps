const crypto = require('crypto');

let kmsClient;

/**
 * Get Cloud KMS client (lazy-loaded)
 */
function getKmsClient() {
  if (!kmsClient) {
    const kms = require('@google-cloud/kms');
    kmsClient = new kms.KeyManagementServiceClient();
  }
  return kmsClient;
}

/**
 * Encrypt plaintext using Cloud KMS
 * @param {string} plaintext - Data to encrypt
 * @returns {Promise<string>} Base64-encoded ciphertext
 */
async function encryptWithKms(plaintext) {
  const client = getKmsClient();

  const projectId = process.env.CLOUD_KMS_PROJECT;
  const locationId = process.env.CLOUD_KMS_LOCATION || 'us-central1';
  const keyRingId = process.env.CLOUD_KMS_KEYRING;
  const keyId = process.env.CLOUD_KMS_KEY;

  const name = client.cryptoKeyPath(projectId, locationId, keyRingId, keyId);

  const [result] = await client.encrypt({
    name,
    plaintext: Buffer.from(plaintext)
  });

  return result.ciphertext.toString('base64');
}

/**
 * Decrypt ciphertext using Cloud KMS
 * @param {string} ciphertext - Base64-encoded ciphertext
 * @returns {Promise<string>} Decrypted plaintext
 */
async function decryptWithKms(ciphertext) {
  const client = getKmsClient();

  const projectId = process.env.CLOUD_KMS_PROJECT;
  const locationId = process.env.CLOUD_KMS_LOCATION || 'us-central1';
  const keyRingId = process.env.CLOUD_KMS_KEYRING;
  const keyId = process.env.CLOUD_KMS_KEY;

  const name = client.cryptoKeyPath(projectId, locationId, keyRingId, keyId);

  const [result] = await client.decrypt({
    name,
    ciphertext: Buffer.from(ciphertext, 'base64')
  });

  return result.plaintext.toString('utf8');
}

module.exports = {
  encryptWithKms,
  decryptWithKms
};
