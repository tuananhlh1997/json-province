// crypto-utils.js - Utility functions cho client
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key-here-change-this'; // Phải giống với server

// Hàm decrypt data
export function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Hàm tạo token
export function generateToken(timestamp) {
  const message = timestamp.toString();
  const token = CryptoJS.HmacSHA256(message, SECRET_KEY).toString();
  return token;
}
