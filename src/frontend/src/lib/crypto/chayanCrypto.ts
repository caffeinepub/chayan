// Simple encryption/decryption using browser's built-in crypto
// In a production app, this would use proper WebCrypto with key exchange

import type { Principal } from '@icp-sdk/core/principal';

const ENCRYPTION_KEY_PREFIX = 'chayan_key_';

// Create a stable conversation identifier from two principals
// Always sorts them to ensure both parties use the same key
export function getConversationId(principal1: Principal, principal2: Principal): string {
  const p1 = principal1.toString();
  const p2 = principal2.toString();
  return p1 < p2 ? `${p1}_${p2}` : `${p2}_${p1}`;
}

function getOrCreateKey(conversationId: string): string {
  const keyName = `${ENCRYPTION_KEY_PREFIX}${conversationId}`;
  let key = localStorage.getItem(keyName);
  
  if (!key) {
    // Generate a simple key (in production, use proper key exchange)
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(keyName, key);
  }
  
  return key;
}

export function encryptMessage(plaintext: string, conversationId: string): string {
  const key = getOrCreateKey(conversationId);
  
  // Simple XOR encryption (for demo purposes only)
  // In production, use WebCrypto AES-GCM
  const encrypted = Array.from(plaintext)
    .map((char, i) => {
      const keyChar = key.charCodeAt(i % key.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    })
    .join('');
  
  return btoa(encrypted);
}

export function decryptMessage(ciphertext: string, conversationId: string): string {
  const key = getOrCreateKey(conversationId);
  
  try {
    const encrypted = atob(ciphertext);
    
    // Simple XOR decryption
    const decrypted = Array.from(encrypted)
      .map((char, i) => {
        const keyChar = key.charCodeAt(i % key.length);
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
      })
      .join('');
    
    return decrypted;
  } catch {
    throw new Error('Decryption failed');
  }
}

// Generate encryption key material for user registration
export function generateEncryptionKeyMaterial(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
