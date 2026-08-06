import CryptoJS from 'crypto-js';

// Default Secret Key for Dynamic Token Generation
const DEFAULT_SECRET_KEY = 'SMANDA_CBT_SECURE_TOKEN_SECRET_2026';
const MANUAL_SALT_KEY = 'smanda_cbt_manual_token_salt';

/**
 * Gets current manual salt counter from localStorage
 */
export function getManualSalt() {
  const stored = localStorage.getItem(MANUAL_SALT_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

/**
 * Increments manual salt to force a new 3-letter token immediately
 */
export function incrementManualSalt() {
  const current = getManualSalt();
  const next = current + 1;
  localStorage.setItem(MANUAL_SALT_KEY, String(next));
  return next;
}

/**
 * Calculates current time block (300 seconds / 5 minutes duration)
 */
export function getCurrentTimeBlock(offsetBlocks = 0) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return Math.floor(nowInSeconds / 300) + offsetBlocks;
}

/**
 * Calculates seconds remaining in the current 5-minute block
 */
export function getSecondsRemainingInBlock() {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return 300 - (nowInSeconds % 300);
}

/**
 * Generates a 3-letter uppercase dynamic token (A-Z only, e.g., 'KJT') for a specific time block and salt
 */
export function generateTokenForBlock(timeBlock, secretKey = DEFAULT_SECRET_KEY, salt = null) {
  const activeSalt = salt !== null ? salt : getManualSalt();
  const inputStr = `BLOCK_${timeBlock}_SALT_${activeSalt}`;
  const hash = CryptoJS.HmacSHA256(inputStr, secretKey || DEFAULT_SECRET_KEY).toString(CryptoJS.enc.Hex);
  
  let letters = '';
  for (let i = 0; i < hash.length && letters.length < 3; i += 2) {
    const byteVal = parseInt(hash.substring(i, i + 2), 16);
    const charCode = 65 + (byteVal % 26); // 65 = 'A', 26 letters A-Z
    letters += String.fromCharCode(charCode);
  }
  return letters;
}

/**
 * Gets current active 3-letter token
 */
export function getActiveToken(secretKey = DEFAULT_SECRET_KEY) {
  const currentBlock = getCurrentTimeBlock(0);
  return generateTokenForBlock(currentBlock, secretKey);
}

/**
 * Validates a user-submitted token against the current active token only
 */
export function validateSubmittedToken(submittedToken, secretKey = DEFAULT_SECRET_KEY) {
  if (!submittedToken) return false;
  // Clean spaces, trim, and convert to uppercase
  const cleanInput = String(submittedToken).replace(/\s+/g, '').toUpperCase();
  const currentToken = getActiveToken(secretKey);
  
  return cleanInput === currentToken;
}

/**
 * Format seconds as mm:ss
 */
export function formatTimeRemaining(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
