const ENCRYPTION_KEY_PREFIX = 'chayan_key_';

export function clearConversationKeys(conversationId: string): void {
  const keyName = `${ENCRYPTION_KEY_PREFIX}${conversationId}`;
  localStorage.removeItem(keyName);
}

export function clearAllKeys(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(ENCRYPTION_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

export function hasKeysForConversation(conversationId: string): boolean {
  const keyName = `${ENCRYPTION_KEY_PREFIX}${conversationId}`;
  return localStorage.getItem(keyName) !== null;
}
