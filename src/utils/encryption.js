const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

// Get encryption key from environment variables or use a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-for-development-only';

/**
 * Utility for encrypting and decrypting sensitive data
 */
const encryption = {
  /**
   * Encrypt a string or object
   * @param {string|object} data - Data to encrypt
   * @returns {string} - Encrypted data as string
   */
  encrypt: (data) => {
    if (!data) return null;
    
    // Convert object to string if necessary
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data.toString();
    
    // Encrypt the data
    return CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
  },
  
  /**
   * Decrypt an encrypted string
   * @param {string} encryptedData - Encrypted data to decrypt
   * @param {boolean} parseJson - Whether to parse the result as JSON
   * @returns {string|object} - Decrypted data
   */
  decrypt: (encryptedData, parseJson = false) => {
    if (!encryptedData) return null;
    
    try {
      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // Parse as JSON if requested
      if (parseJson) {
        return JSON.parse(decryptedString);
      }
      
      return decryptedString;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  },
  
  /**
   * Hash a string (one-way encryption, cannot be decrypted)
   * @param {string} data - Data to hash
   * @returns {string} - Hashed data
   */
  hash: (data) => {
    if (!data) return null;
    return CryptoJS.SHA256(data.toString()).toString();
  },
  
  /**
   * Compare a plain text value with a hash
   * @param {string} plainText - Plain text to compare
   * @param {string} hash - Hash to compare against
   * @returns {boolean} - Whether the plain text matches the hash
   */
  compareHash: (plainText, hash) => {
    if (!plainText || !hash) return false;
    const newHash = CryptoJS.SHA256(plainText.toString()).toString();
    return newHash === hash;
  }
};

module.exports = encryption;
