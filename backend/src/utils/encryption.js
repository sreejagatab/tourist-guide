const CryptoJS = require('crypto-js');
require('dotenv').config();

// Get encryption key from environment variables or use a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'tourist-guide-default-encryption-key';

/**
 * Encrypts sensitive data
 * @param {string} text - The text to encrypt
 * @param {boolean} isJSON - Whether the text is JSON and should be stringified
 * @returns {string} - The encrypted text
 */
const encrypt = (text, isJSON = false) => {
  if (!text) return null;
  
  const textToEncrypt = isJSON ? JSON.stringify(text) : text;
  return CryptoJS.AES.encrypt(textToEncrypt, ENCRYPTION_KEY).toString();
};

/**
 * Decrypts encrypted data
 * @param {string} encryptedText - The encrypted text to decrypt
 * @param {boolean} isJSON - Whether the decrypted text should be parsed as JSON
 * @returns {string|object} - The decrypted text or object
 */
const decrypt = (encryptedText, isJSON = false) => {
  if (!encryptedText) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (isJSON) {
      return JSON.parse(decryptedText);
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = {
  encrypt,
  decrypt
};
